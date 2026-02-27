import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const registerUser = async (email: string, password: string, name: string, role: 'sender' | 'rider', riderData?: any) => {
    try {
        // 1. Firebase Auth Registration
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Save user profile to Firestore (users collection)
        const userData: any = {
            name,
            email,
            role,
            createdAt: new Date().toISOString()
        };

        if (role === 'rider' && riderData) {
            userData.riderProfile = riderData; // keep for backward compatibility
            userData.vehicles = [{
                ...riderData,
                id: Date.now().toString()
            }];
            userData.activeVehicleIndex = 0;
        }

        await setDoc(doc(db, 'users', user.uid), userData);

        // 3. Save session to AsyncStorage
        await AsyncStorage.setItem('userRole', role);
        await AsyncStorage.setItem('userId', user.uid);
        return { user, role };
    } catch (error) {
        console.error("Register Error:", error);
        throw error;
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let role = 'sender';
        if (userDoc.exists()) {
            role = userDoc.data().role;
        }

        // Save session locally with AsyncStorage
        await AsyncStorage.setItem('userRole', role);
        await AsyncStorage.setItem('userId', user.uid);
        return { user, role };
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userId');
};

export const getLocalUser = async () => {
    const role = await AsyncStorage.getItem('userRole');
    const userId = await AsyncStorage.getItem('userId');
    return { role, userId };
}

// --- Data Operations ---

export const getUserProfile = async (userId: string) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (userId: string, data: any) => {
    try {
        await setDoc(doc(db, 'users', userId), data, { merge: true });
    } catch (error) {
        console.error("Update User Profile Error:", error);
        throw error;
    }
};

export const sendPasswordReset = async (email: string) => {
    try {
        const { sendPasswordResetEmail } = await import('firebase/auth');
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Password Reset Error:", error);
        throw error;
    }
};
