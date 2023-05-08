import {
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  ActivityIndicator,
  Alert
} from "react-native";


import { nanoid } from "nanoid";

import * as Location from "expo-location";

import { db } from "../../firebase/config";

import * as ImagePicker from "expo-image-picker";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

import { Camera, CameraType } from "expo-camera";
import { View } from "react-native";

import { Entypo } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

import { storage } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { uploadBytes, ref, getDownloadURL, deleteObject } from "firebase/storage";

import { logError } from "../../firebase/config";

const CreatePostScreen = ({ navigation }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [startCamera, setStartCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [addressLocation, setAddressLocation] = useState(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);
  const [formValues, setFormValues] = useState({ title: "", location: "" });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isShowKeyboard, setIsShowKeyboard] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationPlaceholder, setLocationPlaceholder] = useState("Location...");
  const [isFocus, setIsFocus] = useState({
    title: false,
    location: false,
  });


  const [imageFileName, setImageFileName] = useState(null);

  const [loading, setLoading] = useState(false);

  const inputRef = useRef();

  const { login, userID, userAvatar } = useSelector((state) => state.auth);

  useEffect(() => {
    (async () => {
      await Camera.requestCameraPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        Alert.alert("Permission to access location was denied");
        logError(error)
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      let addressResponse = await Location.reverseGeocodeAsync(coords);
      const address = addressResponse[0].city;
      setLocation(coords);
      setAddressLocation(address);
    })();
  }, []);

  useEffect(() => {
    if (formValues.title && formValues.location) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formValues]);

  const handleLocationPress = () => {
    setFormValues({ ...formValues, location: addressLocation });
  };


  const makePhoto = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const { uri } = await cameraRef.current.takePictureAsync();
        setPhoto(uri);
        setCameraReady(false);
        setLoading(false)
      } catch (error) {
        console.log("Error taking photo:", error);
        Alert.alert("Error taking photo:");
        logError(error);
        setLoading(false)
      }
    } else {
      console.log("Camera ref is null");
      setCameraReady(true);
      setLoading(false)
    }
  };


  const cleanPhoto = async () => {
    setStartCamera(true)
    setPhoto(null);
    setFormValues({ title: "", location: "" });
    if (imageFileName) {
      try {
        const imgRef = ref(storage, imageFileName);
        await deleteObject(imgRef);
        console.log("File deleted successfully");
      }
      catch (error) {
        console.error("Error deleting file:", error);
      }
    }
    setImageFileName(null);
    cameraRef.current = null;
    setCameraReady(true);
  };

  const sendPhotoInfo = () => {
    navigation.navigate("Posts");
  };



  const uploadPhotoToServer = async (photoURI) => {
    try {
      const response = await fetch(photoURI);
      const file = await response.blob();
      const uniquePostId = nanoid();
      const storageRef = ref(storage, `postImage/${uniquePostId}`);
      await uploadBytes(storageRef, file);
      const processedPhoto = await getDownloadURL(storageRef);
      console.log("processedPhoto", processedPhoto);
      return processedPhoto;
    } catch (err) {
      const errorCode = err.code;
      const errorMessage = err.message;
      console.log("errorCode", errorCode);
      console.log("errorMessage", errorMessage);
      Alert.alert('Error downloading photo to storage');
      await logError(err);
    }
  };


  const downloadPhotoFromLocal = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access the camera roll is required!");
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
      try {
        const imageUrl = result.assets[0].uri;
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const imageID = nanoid();
        const filename = `postImage/${imageID}`
        const imageRef = ref(storage, filename);
        await uploadBytes(imageRef, blob);
        const imageURL = await getDownloadURL(imageRef);
        setPhoto(result.assets[0].uri);
        setCameraReady(false);
        cameraRef.current = null;
        setImageFileName(imageURL);
        return { filename, imageURL }
      } catch (error) {
        console.error("Error by adding photo", error);
        setCameraReady(true)
      }
    }
  }

  const uploadPostToServer = async () => {
    const selectedPhoto = await uploadPhotoToServer(photo);
    try {
      setLoading(true);
      const newCollectionRef = collection(db, "posts");
      await addDoc(newCollectionRef, {
        photo: selectedPhoto,
        formValues,
        addressLocation,
        location,
        userID,
        login,
        userAvatar
      });
      console.log(location);
      console.log(`collection has been created successlully!`);
      Alert.alert('Success', 'Collection has been created successfully!');
      setPhoto(null);
      setFormValues({ title: "", location: "" });
      setLoading(false);
      setCameraReady(true);
    } catch (error) {
      console.error("Error by creating collection:", error);
      Alert.alert('Error', 'Error creating collection.');
      await logError(error);
      setLoading(false)
    }
    finally {
      setLoading(false)
    }
  };

  const __startCamera = async () => {
    setLoading(true);
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      // start the camera
      setStartCamera(true);
      setLoading(false)
    } else {
      Alert.alert("Access denied");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {startCamera ? (
        <>
          {!isShowKeyboard && cameraReady && (

            <Camera style={styles.camera} ref={cameraRef}>
              {photo && (
                <View style={styles.takePhotoContainer}>
                  <Image source={{ uri: photo }} style={{ flex: 1 }} />
                </View>
              )}
              <TouchableOpacity style={styles.snapWrapper} onPress={makePhoto}>
                {loading ? (
                  <ActivityIndicator size={24} color="#0000ff" />
                ) : (
                  <Entypo name="camera" size={24} color="#BDBDBD" />
                )}
              </TouchableOpacity>
            </Camera>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
          >
            {!photo ? (
              <Text onPress={downloadPhotoFromLocal} style={styles.text}>Download photo</Text>
            ) : (
              <Text onPress={cleanPhoto} style={styles.text}>
                Edit photo
              </Text>
            )}
            {photo && (
              <View style={styles.photoInfoWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Name..."
                  value={formValues.title}
                  onFocus={() => {
                    setIsShowKeyboard(true);
                    setIsFocus({ ...isFocus, title: true });
                  }}
                  onBlur={() => {
                    setIsShowKeyboard(false);
                    Keyboard.dismiss();
                    setIsFocus({ ...isFocus, title: false });
                  }}
                  onChangeText={(value) => {
                    setFormValues({ ...formValues, title: value });
                  }}
                />
                <View style={styles.inputMapWrapper}>
                  <TouchableOpacity onPress={handleLocationPress}>
                    <Feather
                      name="map-pin"
                      size={18}
                      color="#BDBDBD"
                      style={styles.mapIcon}
                    />
                  </TouchableOpacity>

                  <TextInput
                    ref={inputRef}
                    style={styles.inputMap}
                    placeholder={locationPlaceholder}
                    value={formValues.location}
                    onChangeText={(value) =>
                      setFormValues({ ...formValues, location: value })
                    }
                    onFocus={() => {
                      setIsShowKeyboard(true);
                    }}
                    onBlur={() => {
                      setIsShowKeyboard(false);
                      Keyboard.dismiss();
                    }}
                  />
                </View>
              </View>
            )}
            {photo && (
              <>
                 <TouchableOpacity
                  style={[
                    styles.publishButton,
                    !isFormValid && styles.disabledPublishButton,
                  ]}
                  onPress={() => {
                    if (isFormValid) {
                      uploadPostToServer();
                      sendPhotoInfo();
                    }
                  }}
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.publishButtonText}>Publish</Text>
                  )}
                </TouchableOpacity>
                {photo && (<TouchableOpacity
                  style={styles.cleanBtnWrapper}
                  onPress={cleanPhoto}
                >
                  <Feather name="trash-2" size={24} color="#DADADA" />
                </TouchableOpacity>)}
              </>
            )}
          </KeyboardAvoidingView>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (<ActivityIndicator
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
            }} />) : (
            <TouchableOpacity
              onPress={__startCamera}
              style={{
                width: 130,
                borderRadius: 4,
                backgroundColor: "#14274e",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: 40,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Take picture
              </Text>
            </TouchableOpacity>
          )}

        </View>
      )}
    </View>
  );
};
export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  camera: {
    height: 240,
    marginHorizontal: 16,
    marginTop: 32,
    borderColor: "#E8E8E8",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 8,
  },

  takePhotoContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    borderColor: "#fff",
    borderWidth: 1,
    width: 100,
    height: 100,
  },

  snapWrapper: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    width: 60,
    height: 60,
    borderRadius: 50,
    marginBottom: 10,
  },

  publishButton: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    height: 51,
    marginTop: 30,
    backgroundColor: "#FF6C00",
    borderRadius: 100,
    marginBottom: 30,
  },

  disabledPublishButton: {
    backgroundColor: "#F6F6F6",
  },

  publishButtonText: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
  },

  text: {
    marginLeft: 16,
    marginTop: 8,
    fontSize: 16,
    lineHeight: 19,
    color: "#BDBDBD",
  },

  photoInfoWrapper: {
    marginHorizontal: 16,
  },

  inputMapWrapper: {
    position: "relative",
  },

  input: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 19,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  mapIcon: {
    position: "absolute",
    top: 24,
  },
  inputMap: {
    marginTop: 10,
    marginLeft: 30,
    fontSize: 16,
    lineHeight: 19,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  cleanBtnWrapper: {
    marginLeft: "auto",
    marginRight: "auto",
    width: 70,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
  },
});
