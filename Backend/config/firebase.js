// config/firebase.js
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBxquheZnWbH5JY053hFWXoU5FbaIENNrE",
  authDomain: "dragonfly-958be.firebaseapp.com",
  databaseURL: "https://dragonfly-958be-default-rtdb.firebaseio.com",
  projectId: "dragonfly-958be",
  storageBucket: "dragonfly-958be.appspot.com",
  messagingSenderId: "1019451778562",
  appId: "1:1019451778562:web:b72c595f7d82026d4d291b",
  measurementId: "G-9ZH3LGW52G",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = db;
