import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Skeleton from '../../components/Skeleton';
import { auth, db } from '../../services/firebase';
import { Order } from '../../services/orderService';

export default function RiderHistory() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'orders'),
            where('riderId', '==', user.uid),
            where('status', 'in', ['completed', 'cancelled'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];

            fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(fetchedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 15% Commision cut helper
    const calculateEarnings = (price: number) => {
        return price * 0.85; // 85% for rider
    };

    const totalEarningsThisWeek = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + calculateEarnings(order.price), 0);

    const renderOrderCard = ({ item }: { item: Order }) => {
        const isCompleted = item.status === 'completed';
        const statusText = isCompleted ? 'สำเร็จ' : 'ยกเลิก';
        const statusColor = isCompleted ? '#10b981' : '#ef4444';

        const dateObj = new Date(item.createdAt);
        const dateString = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
        const timeString = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(rider)/order-detail/${item.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.dateText}>{dateString} {timeString}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                </View>

                <View style={styles.locationContainer}>
                    <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker-outline" size={18} color="#94a3b8" />
                        <Text style={styles.locationText} numberOfLines={1}>{item.origin.address}</Text>
                    </View>
                    <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="flag-variant-outline" size={18} color="#94a3b8" />
                        <Text style={styles.locationText} numberOfLines={1}>{item.destination.address}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.paymentMethodText}>รับเงินสด</Text>
                        <Text style={styles.priceGross}>ยอดเก็บ: ฿{item.price.toFixed(2)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.earningsText}>฿{calculateEarnings(item.price).toFixed(2)}</Text>
                        <Text style={styles.earningsLabel}>รายได้สุทธิ</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>ประวัติงานและรายได้</Text>
                </View>
                <View style={[styles.listContainer, { flex: 1 }]}>
                    {[1, 2, 3].map((key) => (
                        <View key={key} style={styles.card}>
                            <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
                            <Skeleton width="90%" height={14} style={{ marginBottom: 8 }} />
                            <Skeleton width="70%" height={14} style={{ marginBottom: 16 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Skeleton width={80} height={20} />
                                <Skeleton width={80} height={20} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ประวัติงานและรายได้</Text>
                <View style={styles.earningsSummary}>
                    <Text style={styles.earningsSummaryLabel}>รายได้รวม (หักคอมมิชชันแล้ว)</Text>
                    <Text style={styles.earningsSummaryValue}>฿{totalEarningsThisWeek.toFixed(2)}</Text>
                </View>
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id!}
                renderItem={renderOrderCard}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome5 name="receipt" size={60} color="#374151" />
                        <Text style={styles.emptyTitle}>ยังไม่มีประวัติการรับงาน</Text>
                        <Text style={styles.emptySubtitle}>งานที่คุณทำสำเร็จจะแสดงที่นี่</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    header: { padding: 24, paddingTop: 40, backgroundColor: '#1f2937', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, zIndex: 10 },
    title: { fontSize: 24, fontWeight: '700', color: '#f9fafb', marginBottom: 16 },
    earningsSummary: { backgroundColor: '#111827', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#10b981' },
    earningsSummaryLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 4 },
    earningsSummaryValue: { fontSize: 28, fontWeight: '800', color: '#10b981' },
    listContainer: { padding: 16, paddingBottom: 40 },

    card: { backgroundColor: '#1f2937', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#374151' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#374151', marginBottom: 12 },
    dateText: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '600' },

    locationContainer: { gap: 8, marginBottom: 16 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    locationText: { flex: 1, fontSize: 14, color: '#e2e8f0' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: 12, borderRadius: 12 },
    priceGross: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    paymentMethodText: { fontSize: 13, color: '#f9fafb', fontWeight: '500' },
    earningsText: { fontSize: 18, fontWeight: '700', color: '#10b981' },
    earningsLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#f9fafb', marginTop: 20, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center' }
});
