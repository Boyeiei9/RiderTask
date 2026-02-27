import { addDoc, collection, doc, getDoc, getDocs, increment, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Order {
    id?: string;
    senderId: string;
    riderId?: string | null;
    status: 'pending' | 'accepted' | 'delivering' | 'completed' | 'cancelled';
    origin: { latitude: number; longitude: number; address: string };
    destination: { latitude: number; longitude: number; address: string };
    packageDetails: { weight: number; width?: number | null; length?: number | null; height?: number | null };
    vehicleType: string;
    paymentMethod?: 'cash' | 'wallet';
    price: number;
    imageUrl?: string | null;
    createdAt: string;
    riderRating?: number | null;
    riderFeedback?: string | null;
    actualDistance?: number | null;
    actualDuration?: number | null;
}

export const createOrder = async (orderData: Order) => {
    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...orderData,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error("Create Order Error:", error);
        throw error;
    }
};

export const getSenderOrders = async (senderId: string) => {
    try {
        const q = query(collection(db, 'orders'), where('senderId', '==', senderId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error("Fetch Sender Orders Error:", error);
        throw error;
    }
};

export const getRiderOrders = async (riderId: string) => {
    try {
        const q = query(collection(db, 'orders'), where('riderId', '==', riderId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error("Fetch Rider Orders Error:", error);
        throw error;
    }
};

export const getAvailableOrders = async () => {
    try {
        const q = query(collection(db, 'orders'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error("Fetch Available Orders Error:", error);
        throw error;
    }
};

export const acceptOrder = async (orderId: string, riderId: string) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'accepted',
            riderId: riderId
        });
    } catch (error) {
        console.error("Accept Order Error:", error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        throw error;
    }
};

export const cancelOrder = async (orderId: string) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'cancelled',
        });
    } catch (error) {
        console.error("Cancel Order Error:", error);
        throw error;
    }
};

export const completeOrder = async (orderId: string) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error("Order not found");
        }

        const orderData = orderSnap.data() as Order;

        await updateDoc(orderRef, {
            status: 'completed'
        });

        if (orderData.senderId) {
            const senderRef = doc(db, 'users', orderData.senderId);
            await updateDoc(senderRef, {
                points: increment(5)
            });
        }

        if (orderData.riderId) {
            const riderRef = doc(db, 'users', orderData.riderId);
            await updateDoc(riderRef, {
                points: increment(5)
            });
        }

    } catch (error) {
        console.error("Complete Order Error:", error);
        throw error;
    }
};
