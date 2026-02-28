import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

export const uploadImageAsync = async (uri: string, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);

        // วิธีที่เสถียรที่สุดใน React Native ในการแปลง URI เป็น Blob
        const blob: any = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.error("XHR Error:", e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        // อัปโหลด Blob ขึ้น Firebase
        await uploadBytes(storageRef, blob);

        // ปิด Blob เพื่อคืนหน่วยความจำ (สำคัญใน React Native)
        if (blob && blob.close) {
            blob.close();
        }

        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error) {
        console.error("Error uploading image to Firebase Storage:", error);
        throw error;
    }
};
