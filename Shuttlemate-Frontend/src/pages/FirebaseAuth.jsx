// src/components/FirebaseAuth.js
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut ,GoogleAuthProvider} from "firebase/auth";
import { auth, provider } from "../firebase/firebaseconfig";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";


export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Email/Password Register
export const register = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Google Sign-in
export const googleSignIn = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Sign-out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};


//Reset password
export const resetPassword = (email) => {
  const auth = getAuth();
  return sendPasswordResetEmail(auth, email);
};


// Google Registration/Sign-in
const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};