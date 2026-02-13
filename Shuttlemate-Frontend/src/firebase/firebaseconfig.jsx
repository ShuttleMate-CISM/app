// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAZdo9s-W0U2LGU9JfP8jdwOBa2sDbz2uA",
    authDomain: "shuttlemate-9bedd.firebaseapp.com",
    projectId: "shuttlemate-9bedd",
    storageBucket: "shuttlemate-9bedd.appspot.com",
    messagingSenderId: "902062135902",
    appId: "1:902062135902:web:8d8d923e3d85771262b2cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporting authentication and provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);
export { auth, provider , storage};
