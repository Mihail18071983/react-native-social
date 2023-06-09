import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";

import * as ImagePicker from "expo-image-picker";

import * as crypto from 'expo-crypto';

import * as Random from 'expo-random';


import { authSlice } from "../../redux/auth/authReducer";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";

import Icon from "react-native-vector-icons/Feather";

import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';

import { useDispatch, useSelector } from "react-redux";

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

import { authLogOutUser } from "../../redux/auth/authOperations";
import { db, storage } from "../../firebase/config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "@firebase/storage";


const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [userPosts, setUserPosts] = useState(null);
  const [commentsCount, setCommentsCount] = useState({});
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { userID, login, userAvatar, email } = useSelector((state) => state.auth);
  console.log("userAvatar in profile", userAvatar);

  const { updateUserProfile } = authSlice.actions;

  useEffect(() => {
    if (route.params?.commentsCount) {
      setCommentsCount((prev) => ({
        ...prev,
        [route.params.postID]: route.params.commentsCount,
      }));
    }
  }, [route.params]);

  const getCommentsCount = async (postID) => {
    try {
      const commentsRef = collection(db, `posts/${postID}/comments`);
      const queryRef = query(commentsRef);
      const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
        const commentsCount = querySnapshot.docs.length;
        setCommentsCount((prev) => ({ ...prev, [postID]: commentsCount }));
        console.log("PostID", postID);
      });
      return () => unsubscribe();
    } catch (error) {
      console.log(error);
      setCommentsCount((prev) => ({ ...prev, [postID]: 0 }));
    }
  };

  const hashImageContents = async (imageBlob) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onerror = () => {
        fileReader.abort();
        reject(new Error("Failed to hash image contents."));
      };
      fileReader.onload = async () => {
        try {
          const data = fileReader.result;
          let digest;
          if (crypto && crypto.getRandomValues) {
            digest = await crypto.digestStringAsync(
              crypto.CryptoDigestAlgorithm.SHA256,
              data
            );
          } else {
            const buffer = await Random.getRandomBytesAsync(data.length);
            const bytes = new Uint8Array(buffer);
            const messageArray = new Uint8Array(data.length);
            for (let i = 0; i < data.length; i++) {
              messageArray[i] = data.charCodeAt(i);
            }
            const hashArray = await sha256(messageArray);
            const hashBytes = new Uint8Array(hashArray.buffer);
            digest = hashBytes.reduce((output, byte) => output + byte.toString(16).padStart(2, '0'), '');
          }
          resolve(digest);
        } catch (error) {
          reject(new Error("Failed to hash image contents."));
        }
      };
      fileReader.readAsDataURL(imageBlob);
    });
  };



  const uploadAvatar = async () => {
    if (userAvatar) {
      try {
        setLoading(true);

        // Compute the hash of the image contents
        const response = await fetch(userAvatar);
        const file = await response.blob();
        const imageHash = await hashImageContents(file);

        // Check if there's already an image with the same hash in the database
        const userAvatarRef = collection(db, "userAvatar");
        const q = query(userAvatarRef, where("imageHash", "==", imageHash));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].id;
          console.log("docID", docId);
          // An image with the same hash already exists, use its URL instead of uploading
          const downloadURL = querySnapshot.docs[0].data().userAvatar;
          dispatch(updateUserProfile({ userAvatar: downloadURL, userID, login, email }));
          Alert.alert("Image avatar has already been uploaded");
          setLoading(false);
          return;
        }

        // The image is new, upload it to the storage and add it to the database
        const avatarID = nanoid();
        const storageRef = ref(storage, `userAvatar/${avatarID}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        const fullStoragePath = storageRef.fullPath;

        const uniqueId = nanoid();
        await addDoc(userAvatarRef, {
          id: uniqueId,
          userAvatar: downloadURL,
          imageHash,
          fullStoragePath,
          userID,
        });
        // setAvatar(downloadURL);
        dispatch(updateUserProfile({ userAvatar: downloadURL, userID, login, email }));
        Alert.alert("Image avatar has successfulyuploaded");
        setLoading(false);
      } catch (err) {
        console.log(err);
        Alert.alert('Error uploading avatar')
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    uploadAvatar();
  }, [userAvatar]);



  // Function to handle avatar update in the profile screen
  const updateAvatar = async () => {
    try {
      setLoading(true);

      // Request permission to access the camera roll
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access the camera roll is required!");
        setLoading(false);
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const imageUrl = result.assets[0].uri;
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Upload the new avatar image to the "userAvatar" folder in Firebase Storage
        const avatarID = nanoid();
        const avatarRef = ref(storage, `userAvatar/${avatarID}`);
        await uploadBytes(avatarRef, blob);
        const downloadURL = await getDownloadURL(avatarRef);

        // Update the userAvatar collection in Firestore with the new avatar details
        const userAvatarRef = collection(db, "userAvatar");
        const querySnapshot = await getDocs(query(userAvatarRef));
        if (querySnapshot.docs.length > 0) {
          // Update the existing document
          const docId = querySnapshot.docs[0].id;
          const docRef = doc(userAvatarRef, docId);
          await updateDoc(docRef, { userAvatar: downloadURL });
        } else {
          // Create a new document
          await addDoc(userAvatarRef, { userAvatar: downloadURL });
        }

        // Update the local state and Redux store with the new avatar
        dispatch(updateUserProfile({ userAvatar: downloadURL, userID, login, email }));
        Alert.alert('Image avatar updated successfully')
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error updating avatar')
      setLoading(false);
    }
  };


  const getPostByUserID = async (userID) => {
    const q = query(collection(db, 'posts'), where('userID', '==', userID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0];
    }

    return null;
  };

  const handleLikesCount = async () => {
    setLikesCount(prevState => prevState + 1);

    try {
      const postRef = await getPostByUserID(userID);
      if (postRef) {
        await updateLikesCount(postRef.id, likesCount + 1);
        console.log('Likes count updated in Firestore');
        Alert.alert('Likes count updated in Firestore')

      }
    } catch (error) {
      console.error('Error updating likes count:', error);
      Alert.alert('Error updating likes count')
    }
  };

  const updateLikesCount = async (postID, newLikesCount) => {
    const postRef = doc(db, 'posts', postID);
    await updateDoc(postRef, { likes: newLikesCount });
  };

  useEffect(() => {
    const fetchLikesCount = async () => {
      try {
        const postRef = await getPostByUserID(userID);
        if (postRef) {
          const postData = postRef.data();
          setLikesCount(postData.likes || 0);
        }
      } catch (error) {
        console.error('Error fetching likes count:', error);
        Alert.alert('Error fetching likes count')
      }
    };

    fetchLikesCount();
  }, [userID]);

  const getUserPosts = async () => {
    try {
      const userPostsRef = collection(db, "posts");
      const queryRef = query(userPostsRef, where("userID", "==", userID));
      const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
        const userPosts = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setUserPosts(userPosts);

        if (userPosts && userPosts.length > 0) {
          userPosts.forEach((post) => {
            getCommentsCount(post.id.toString());
          });
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = () => {
    dispatch(authLogOutUser());
  };

  useEffect(() => {
    getUserPosts();
    return () => getUserPosts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.image}
        source={require("../../assets/images/photo-bg2x.jpg")}
      >
        <View style={styles.contentWrapprer}>
          <TouchableOpacity style={styles.btn} onPress={signOut}>
            <Feather name="log-out" size={24} color="#981010" />
          </TouchableOpacity>
          {!loading ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: userAvatar }}
                style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 16 }}
              />
              <TouchableOpacity
                style={styles.changeAvatarBtn}
                onPress={updateAvatar}
              >
                <MaterialIcons name="update" size={24} color="#981010" />
              </TouchableOpacity>
            </View>
          ) : (
            <ActivityIndicator
              size={50}
              color="#0000ff"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            />
          )}
          <Text style={styles.userName}>{login}</Text>
          {userPosts && userPosts.length > 0 && (
            <View style={{ flex: 1 }}>
              <FlatList
                data={userPosts}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingBottom: 20,
                  paddingTop: 20,
                  marginHorizontal: 16,
                }}
                renderItem={({ item }) => {
                  return (
                    <View
                      style={{
                        marginBottom: 10,
                        borderRadius: 8
                      }}
                    >
                      <Image
                        source={{ uri: item.photo }}
                        style={{
                          width: '100%',
                          height: 200,
                          marginTop: 10,
                          borderRadius: 8,
                          overflow: 'hidden'
                        }}
                      />
                      <View style={styles.titleWrapper}>
                        <Text>{item.formValues.title}</Text>
                      </View>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 2 }}>
                          <View style={styles.commentsCountWrapper}>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate("Comments", {
                                  postID: item.id,
                                  photo: item.photo,
                                })
                              }
                            >
                              <Icon
                                name="message-circle"
                                size={24}
                                color="#FF6C00"
                              />
                            </TouchableOpacity>
                            <Text>{commentsCount[item.id] || 0}</Text>
                          </View>
                          <View style={styles.likesWrapper}>
                            <TouchableOpacity
                              onPress={handleLikesCount}
                            >
                              <Feather name="thumbs-up" size={24} color="#FF6C00" />
                            </TouchableOpacity>
                            <Text>{likesCount}</Text>
                          </View>
                        </View>

                        <View style={styles.locationWrapper}>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate("Map", {
                                location: item.location,
                                title: item.formValues.title,
                              })
                            }
                          >
                            <Feather
                              name="map-pin"
                              size={18}
                              color="#BDBDBD"
                              style={styles.mapIcon}
                            />
                          </TouchableOpacity>

                          <Text style={styles.locationText}>
                            {item.formValues.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-end",
  },

  contentWrapprer: {
    marginTop: 100,
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  userName: {
    fontFamily: "Roboto",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "semibold",
    color: "#000000",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 33,
  },

  titleWrapper: {
    marginTop: 8,
    marginBottom: 11,
    width: 300,
  },
  locationWrapper: {
    flex: 1,
    flexDirection: "row",
    width: 300,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 16,
    lineHeight: 19,
  },

  btn: {
    position: "absolute",
    right: 16,
    top: 22,
  },

  commentsCountWrapper: {
    flexDirection: "row",
    marginRight: 24,
  },
  likesWrapper: {
    flexDirection: "row",
  },

  imageWrapper: {
    left: "35%",
    top: "-10%",
    zIndex: 100,
    width: 120,
    height: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
  },

  changeAvatarBtn: {
    position: "absolute",
    top: "-15%",
    left: "90%",
    fontSize: 16,
    lineHeight: 19,
  },
});
