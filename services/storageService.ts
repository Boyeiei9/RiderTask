import { getDownloadURL, ref, uploadBytes, uploadString } from 'firebase/storage';
import { storage } from './firebase';

export const uploadImageAsync = async (uri: string, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);

        if (uri.startsWith('data:')) {
            // Safest method for React Native: Base64 Data URL string
            await uploadString(storageRef, uri, 'data_url');
        } else {
            // Fallback for normal URIs
            const response = await fetch(uri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
        }

        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error) {
        console.error("Error uploading image to Firebase Storage:", error);
        throw error;
    }
};
