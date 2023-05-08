import React from "react";
import { useState, useEffect } from "react";

import { useSelector } from "react-redux";

import { onSnapshot, collection } from "firebase/firestore";

import { db } from "../../firebase/config";

import { Feather } from "@expo/vector-icons";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";


const PostItem = ({ item, navigation }) => {
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, `posts/${item.id}/comments`),
      (data) => {
        setCommentsCount(data.docs.length);
      }
    );
    return () => unsubscribe();
  }, [item.id]);

  return (
    <View
      style={{
        marginBottom: 20,
        alignItems: 'center',
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
      <View style={{ flex: 1, flexDirection: "row", maxWidth: 350 }}>
        <View style={styles.commentsCountWrapper}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Comments", {
                postID: item.id,
                photo: item.photo,
              })
            }
          >
            <Feather name="message-circle" size={24} color="black" />
          </TouchableOpacity>
          <Text>{commentsCount}</Text>
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
            <Feather name="map-pin" size={18} color="#BDBDBD" />
          </TouchableOpacity>

          <Text style={styles.locationText}>{item.formValues.location}</Text>
        </View>
      </View>
    </View>
  );
};

const PostsScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [avatar, setAvatar]=useState(null)
  const { login, userAvatar, email } = useSelector((state) => state.auth);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts"), (data) => {
      const posts = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setPosts(posts);
    });
    return () => unsubscribe();
  }, []);

  console.log('avatar in postScreen', userAvatar)

  useEffect(() => {
    setAvatar(userAvatar); // Replace 'userAvatar' with the actual value from the Redux store
  }, [userAvatar]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userWrapper}>
        <Image source={{ uri: userAvatar }}
          style={{
            width: 60,
            height: 60,
            overflow: "hidden",
            borderRadius: 16,
            marginRight: 5
          }} />
        <View>
          <Text style={styles.userName}>{login}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostItem item={item} navigation={navigation} />
        )}
      />
    </SafeAreaView>
  );
};

export default PostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
  },
  userWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },

  userName: {
    fontSize: 13,
    lineHeight: 15,
    fontFamily: "Roboto-Medium",
    fontWeight: "bold",
    color: "#212121",
  },
  userEmail: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: "Roboto-Medium",
    fontWeight: "normal",
    color: "#212121",
  },

  locationWrapper: {
    flex: 1,
    flexDirection: "row",
  },
  locationText: {
    marginLeft: 5,
    fontSize: 16,
    lineHeight: 19,
  },
  titleWrapper: {
    marginTop: 8,
    marginBottom: 11,
    width: 320,
  },
  commentsCountWrapper: {
    flexDirection: "row",
    flexGrow: 2,
  },
});
