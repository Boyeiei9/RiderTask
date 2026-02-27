import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Skeleton from '../../components/Skeleton';
import { getUserProfile } from '../../services/authService';
import { auth, db } from '../../services/firebase';
import { Order } from '../../services/orderService';

export default function SenderHistory() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [riderProfiles, setRiderProfiles] = useState<Record<string, any>>({});

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'orders'),
            where('senderId', '==', user.uid),
            where('status', 'in', ['completed', 'cancelled'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];

            // Sort by createdAt descending
            fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(fetchedOrders);

            // Fetch rider profiles for orders that have a riderId
            const riderIds = Array.from(new Set(fetchedOrders.filter(o => o.riderId).map(o => o.riderId as string)));
            if (riderIds.length > 0) {
                Promise.all(riderIds.map(id => getUserProfile(id).then(profile => ({ id, profile }))))
                    .then(results => {
                        const profiles: Record<string, any> = {};
                        results.forEach(({ id, profile }) => {
                            if (profile) profiles[id] = profile;
                        });
                        setRiderProfiles(profiles);
                    })
                    .catch(console.error)
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const renderOrderCard = ({ item }: { item: Order }) => {
        const isCompleted = item.status === 'completed';
        const statusText = isCompleted ? 'จัดส่งสำเร็จ' : 'ยกเลิกแล้ว';
        const statusColor = isCompleted ? '#10b981' : '#ef4444';
        const StatusIcon = isCompleted ? 'check-circle' : 'times-circle';

        const dateObj = new Date(item.createdAt);
        const dateString = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
        const timeString = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')} น.`;

        const rider = item.riderId ? riderProfiles[item.riderId] : null;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/order-detail/${item.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.dateText}>{dateString}  {timeString}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isCompleted ? '#d1fae5' : '#fee2e2' }]}>
                        <FontAwesome5 name={StatusIcon} size={12} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                </View>

                {rider && (
                    <View style={styles.riderSnapshot}>
                        {rider.avatarUrl ? (
                            <Image source={{ uri: rider.avatarUrl }} style={styles.riderAvatar} />
                        ) : (
                            <View style={styles.riderAvatarPlaceholder}>
                                <FontAwesome5 name="user-alt" size={16} color="#94a3b8" />
                            </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.riderName}>{rider.name}</Text>
                            <Text style={styles.riderVehicle}>{rider.riderProfile?.plate || 'ไม่ระบุ'} • {item.vehicleType}</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={item.vehicleType === 'รถมอเตอร์ไซค์' ? 'motorbike' : item.vehicleType === 'รถกระบะ' ? 'truck' : 'car'}
                            size={24}
                            color="#94a3b8"
                        />
                    </View>
                )}

                <View style={styles.locationContainer}>
                    <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={20} color="#3b82f6" style={styles.locationIcon} />
                        <Text style={styles.locationText} numberOfLines={1}>{item.origin.address}</Text>
                    </View>
                    <View style={styles.locationDivider} />
                    <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="flag-checkered" size={20} color="#ef4444" style={styles.locationIcon} />
                        <Text style={styles.locationText} numberOfLines={1}>{item.destination.address}</Text>
                    </View>
                </View>

                {item.imageUrl && (
                    <View style={styles.packageImageContainer}>
                        <Image source={{ uri: item.imageUrl }} style={styles.packageImage} />
                    </View>
                )}

                <View style={styles.cardFooter}>
                    <Text style={styles.priceText}>฿{item.price.toFixed(2)}</Text>
                    {isCompleted && item.riderRating && (
                        <View style={styles.ratingBadge}>
                            <FontAwesome5 name="star" size={12} color="#f59e0b" solid />
                            <Text style={styles.ratingText}>{item.riderRating}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>ประวัติการใช้งาน</Text>
                </View>
                <View style={styles.listContainer}>
                    {[1, 2, 3].map((key) => (
                        <View key={key} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Skeleton width={120} height={16} />
                                <Skeleton width={80} height={24} borderRadius={12} />
                            </View>
                            <Skeleton width="100%" height={60} borderRadius={12} style={{ marginBottom: 16 }} />
                            <View style={styles.cardFooter}>
                                <Skeleton width={80} height={24} />
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
                <Text style={styles.title}>ประวัติการใช้งาน</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <FontAwesome5 name="receipt" size={60} color="#fbbf24" />
                    </View>
                    <Text style={styles.emptyTitle}>ทบทวนรายการที่แล้ว</Text>
                    <Text style={styles.emptyText}>เมื่อคุณมีการจัดส่งสำเร็จหรือยกเลิก ประวัติเหล่านั้นจะแสดงที่นี่</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id!}
                    renderItem={renderOrderCard}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    header: { padding: 24, paddingTop: 40, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
    title: { fontSize: 24, fontWeight: '700', color: '#f8fafc' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 32, marginTop: 40 },
    emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(251, 191, 36, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
    emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
    listContainer: { padding: 16 },
    card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    dateText: { fontSize: 14, color: '#94a3b8' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '600', marginLeft: 6 },
    locationContainer: { backgroundColor: '#0f172a', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    locationIcon: { marginRight: 12, width: 24, textAlign: 'center' },
    locationText: { fontSize: 14, color: '#f8fafc', flex: 1 },
    locationDivider: { height: 16, borderLeftWidth: 1, borderLeftColor: '#475569', borderStyle: 'dashed', marginLeft: 11, marginVertical: 4 },
    packageImageContainer: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', height: 120 },
    packageImage: { width: '100%', height: '100%' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 16 },
    priceText: { fontSize: 18, fontWeight: 'bold', color: '#fbbf24' },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    ratingText: { fontSize: 14, fontWeight: '600', color: '#fbbf24', marginLeft: 6 },

    // Rider snapshot styles
    riderSnapshot: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
    riderAvatar: { width: 40, height: 40, borderRadius: 20 },
    riderAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
    riderName: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
    riderVehicle: { fontSize: 12, color: '#94a3b8', marginTop: 2 }
});
