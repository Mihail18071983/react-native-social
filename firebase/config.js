import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, collection, addDoc } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD57jRePn3Ca5XU30DLu8WI7PI6li7L5cw",
  authDomain: "react-native-app-dee0f.firebaseapp.com",
  projectId: "react-native-app-dee0f",
  storageBucket: "react-native-app-dee0f.appspot.com",
  messagingSenderId: "630398997473",
  appId: "1:630398997473:web:d5d4eab9ec64eab0d6f8a0",
};
const app = initializeApp(firebaseConfig);


export const logError = async (error) => {
  const errorCollectionRef = collection(db, 'errors');
  await addDoc(errorCollectionRef, {
    timestamp: new Date(),
    error: error.toString(),
  });
};

export default app;

export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);

