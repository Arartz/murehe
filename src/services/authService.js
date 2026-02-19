import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updatePassword,
    updateEmail,
    getAuth,
    createUserWithEmailAndPassword as secondaryCreate
} from "firebase/auth";
import { auth, firebaseConfig } from "./firebase";
import { initializeApp } from "firebase/app";

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
};

export const updateUserPassword = (newPassword) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    return updatePassword(auth.currentUser, newPassword);
};

export const updateUserEmail = (newEmail) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    return updateEmail(auth.currentUser, newEmail);
};

export const logout = () => {
    return signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Creates a user without logging out the current context (Admin).
 * Uses a secondary Firebase App instance.
 */
export const createSecondaryUser = async (email, password, ...rest) => {
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);
    try {
        const userCredential = await secondaryCreate(secondaryAuth, email, password);
        return userCredential.user;
    } finally {
        // We can't easily "delete" the app here without side effects, 
        // but Firebase will handle the instance.
    }
};
