import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import OrderCard from '../../components/OrderCard';
import Skeleton from '../../components/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { getSenderOrders, Order } from '../../services/orderService';

export default function SenderOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { userId } = useAuth();

    const fetchOrders = async () => {
        if (!userId) return;
        try {
            const data = await getSenderOrders(userId);
            // Filter completed and cancelled orders out of the Active Orders list
            const activeOrders = data.filter(o => !['completed', 'cancelled'].includes(o.status));
            // Sort by creation date descending
            activeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(activeOrders);
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
        }, [userId])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.listContainer}>
                    {[1, 2, 3].map((key) => (
                        <View key={key} style={styles.skeletonCard}>
                            <View style={styles.skeletonHeader}>
                                <Skeleton width={100} height={20} />
                                <Skeleton width={80} height={24} borderRadius={12} />
                            </View>
                            <Skeleton width="100%" height={16} style={{ marginTop: 12 }} />
                            <Skeleton width="80%" height={16} style={{ marginTop: 8 }} />
                            <View style={styles.skeletonFooter}>
                                <Skeleton width={120} height={16} />
                                <Skeleton width={60} height={20} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={({ item }) => <OrderCard order={item} role="sender" />}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <FontAwesome5 name="box-open" size={60} color="#fbbf24" />
                        </View>
                        <Text style={styles.emptyTitle}>พร้อมส่งพัสดุชิ้นแรกหรือยัง?</Text>
                        <Text style={styles.emptySubtitle}>กดปุ่ม "+" ด่านล่างเพื่อเริ่มสร้างออเดอร์ใหม่</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    listContainer: { padding: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
    emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 32 },

    // Skeleton styles
    skeletonCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 16 },
    skeletonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    skeletonFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' }
});
