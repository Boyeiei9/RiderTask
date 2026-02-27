import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderCard from '../../components/OrderCard';
import { getUserProfile } from '../../services/authService';
import { auth, db } from '../../services/firebase';
import { getAvailableOrders, Order } from '../../services/orderService';

export default function RiderHome() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Get rider's active vehicle type
            const profile = await getUserProfile(user.uid);
            const activeVehicles = profile?.vehicles || [];
            const activeIndex = profile?.activeVehicleIndex || 0;
            const myVehicleType = activeVehicles[activeIndex]?.vehicleType || profile?.riderProfile?.vehicleType || '';

            const data = await getAvailableOrders();
            // FILTER DEBUG LOGS
            console.log("------------------------");
            console.log("Rider's active vehicle type to match:", myVehicleType);
            if (data.length > 0) {
                console.log("Found", data.length, "pending orders from DB.");
                console.log("First pending order vehicleType:", data[0].vehicleType);
            } else {
                console.log("No pending orders found in DB.");
            }

            // Filter out orders that don't match the rider's vehicle
            const isMotorcycle = (type: string) => type === 'มอเตอร์ไซค์' || type === 'รถมอเตอร์ไซค์';
            const compatibleOrders = data.filter(order => {
                if (isMotorcycle(myVehicleType) && isMotorcycle(order.vehicleType)) return true;
                return order.vehicleType === myVehicleType;
            });
            console.log("Compatible orders after filter:", compatibleOrders.length);
            console.log("------------------------");

            // Sort by creation date descending
            compatibleOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(compatibleOrders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();

            const user = auth.currentUser;
            if (!user) return;

            const q = query(
                collection(db, 'orders'),
                where('riderId', '==', user.uid),
                where('status', 'in', ['accepted', 'delivering'])
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const docSnap = snapshot.docs[0];
                    setActiveOrder({ id: docSnap.id, ...docSnap.data() } as Order);
                } else {
                    setActiveOrder(null);
                }
            });

            return () => unsubscribe();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
                <Text style={styles.subtitle}>กรุณาตรวจสอบรายละเอียดก่อนรับงาน</Text>
            </View>

            {activeOrder && (
                <TouchableOpacity
                    style={styles.activeJobBanner}
                    onPress={() => router.push(`/(rider)/order-detail/${activeOrder.id}`)}
                    activeOpacity={0.8}
                >
                    <View style={styles.activeJobIcon}>
                        <FontAwesome5 name={activeOrder.status === 'accepted' ? 'box' : 'motorcycle'} size={24} color="#fff" />
                    </View>
                    <View style={styles.activeJobTextContainer}>
                        <Text style={styles.activeJobTitle}>งานที่กำลังดำเนินการ</Text>
                        <Text style={styles.activeJobSubtitle}>
                            {activeOrder.status === 'accepted' ? 'กำลังเดินทางไปรับพัสดุ' : 'กำลังจัดส่งพัสดุ'}
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#10b981" />
                </TouchableOpacity>
            )}

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={({ item }) => <OrderCard order={item} role="rider" />}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>ยังไม่มีงานใหม่ในขณะนี้</Text>
                        <Text style={styles.emptySubtitle}>ลองดึงหน้าจอลงเพื่อรีเฟรช</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
    title: { fontSize: 24, fontWeight: '700', color: '#fbbf24' },
    subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
    profileButton: { padding: 4 },
    listContainer: { padding: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 20, fontWeight: '600', color: '#f8fafc', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#94a3b8' },
    activeJobBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fbbf2415', margin: 16, marginBottom: 0, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fbbf24', shadowColor: '#fbbf24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    activeJobIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fbbf24', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    activeJobTextContainer: { flex: 1 },
    activeJobTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 2 },
    activeJobSubtitle: { fontSize: 13, color: '#fbbf24' }
});
