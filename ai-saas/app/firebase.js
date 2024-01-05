// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getApp } from "firebase/app";
import { firestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAuZWbthJtDaOru_KCCVok1xP2xwYFnddc",
  authDomain: "ai-saas-ab86b.firebaseapp.com",
  projectId: "ai-saas-ab86b",
  storageBucket: "ai-saas-ab86b.appspot.com",
  messagingSenderId: "133115978483",
  appId: "1:133115978483:web:84cc7435c39e8e78310d86",
  storageBucket: "gs://ai-saas-ab86b.appspot.com",
  databaseURL: "https://ai-saas-ab86b.firebaseio.com"
};

// Initialize Firebase
const fb = initializeApp(firebaseConfig);
//const db = firestore();
const st = getStorage(fb);
export {fb,st};
//export const storage = firebase.storage().ref();