import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../services/firebase';
import { acceptOrder, completeOrder, Order, updateOrderStatus } from '../../../services/orderService';

export default function RiderOrderDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { userId } = useAuth();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = onSnapshot(doc(db, 'orders', id as string), (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id]);

    const handleAccept = async () => {
        if (!order || !order.id || !userId) return;

        Alert.alert(
            'ยืนยันการรับงาน',
            'คุณต้องการรับงานนี้ใช่หรือไม่?',
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ยืนยัน',
                    onPress: async () => {
                        try {
                            setAccepting(true);
                            await acceptOrder(order.id!, userId);
                            Alert.alert('สำเร็จ', 'คุณรับงานเรียบร้อยแล้ว');
                        } catch (error) {
                            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถรับงานได้ กรุณาลองใหม่');
                        } finally {
                            setAccepting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateStatus = async (newStatus: Order['status']) => {
        if (!order || !order.id) return;
        try {
            setAccepting(true);
            if (newStatus === 'completed') {
                await completeOrder(order.id);
                Alert.alert('สำเร็จ', 'จัดส่งพัสดุเรียบร้อยแล้ว!', [{ text: 'ตกลง', onPress: () => router.push('/(rider)') }]);
            } else {
                await updateOrderStatus(order.id, newStatus);
            }
        } catch (error) {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้');
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>ไม่พบข้อมูลคำสั่งซื้อ</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>รายละเอียดงาน</Text>
                <Text style={styles.subtitle}>ID: {order.id}</Text>
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: (order.origin.latitude + order.destination.latitude) / 2,
                        longitude: (order.origin.longitude + order.destination.longitude) / 2,
                        latitudeDelta: 0.15,
                        longitudeDelta: 0.15,
                    }}
                >
                    <Marker coordinate={{ latitude: order.origin.latitude, longitude: order.origin.longitude }} title="จุดรับของ" pinColor="blue" />
                    <Marker coordinate={{ latitude: order.destination.latitude, longitude: order.destination.longitude }} title="จุดส่งของ" pinColor="red" />
                </MapView>
            </View>

            <View style={styles.detailsCard}>

                {['accepted', 'delivering'].includes(order.status) && (
                    <View style={styles.contactRow}>
                        <View style={styles.contactInfo}>
                            <View style={styles.contactAvatar}>
                                <FontAwesome5 name="user-alt" size={20} color="#64748b" />
                            </View>
                            <View>
                                <Text style={styles.contactName}>ผู้ส่งพัสดุ</Text>
                                <Text style={styles.contactSub}>คุณสามารถแชทเพื่อสอบถามได้</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.chatButton}
                            onPress={() => router.push(`/(rider)/chat/${order.id}` as any)}
                        >
                            <FontAwesome5 name="comment-dots" size={20} color="#10b981" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>ค่าจัดส่ง (รายได้ของคุณ)</Text>
                    <Text style={styles.priceValue}>฿{order.price.toFixed(2)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker-up" size={24} color="#3b82f6" />
                    <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>📍 รับของที่</Text>
                        <Text style={styles.detailValue}>{order.origin.address}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker-down" size={24} color="#ef4444" />
                    <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>🏁 ส่งของที่</Text>
                        <Text style={styles.detailValue}>{order.destination.address}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.packageBox}>
                    <Text style={styles.boxTitle}>📦 ข้อมูลพัสดุ</Text>
                    <Text style={styles.boxDetail}>ประเภทรถที่ต้องการ: <Text style={{ fontWeight: '700' }}>{order.vehicleType}</Text></Text>
                    <Text style={styles.boxDetail}>น้ำหนัก: {order.packageDetails.weight} kg</Text>
                    <Text style={styles.boxDetail}>ขนาด: {order.packageDetails.width}x{order.packageDetails.length}x{order.packageDetails.height} cm</Text>
                </View>

                {/* Dynamic Actions Based on Status */}
                {order.status === 'pending' && (
                    <TouchableOpacity
                        style={[styles.acceptButton, order.status !== 'pending' && styles.disabledButton]}
                        onPress={handleAccept}
                        disabled={accepting || order.status !== 'pending'}
                    >
                        {accepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>✅ รับงานนี้</Text>}
                    </TouchableOpacity>
                )}

                {order.status === 'accepted' && (
                    <TouchableOpacity
                        style={styles.arriveButton}
                        onPress={() => handleUpdateStatus('delivering')}
                        disabled={accepting}
                    >
                        {accepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>📍 ถึงจุดรับของแล้ว</Text>}
                    </TouchableOpacity>
                )}

                {order.status === 'delivering' && (
                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => handleUpdateStatus('completed')}
                        disabled={accepting}
                    >
                        {accepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🏁 จัดส่งสำเร็จ</Text>}
                    </TouchableOpacity>
                )}

                {/* Delivery Completed Summary */}
                {order.status === 'completed' && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <FontAwesome5 name="check-circle" size={40} color="#10b981" />
                            <Text style={styles.summaryTitle}>🎉 จัดส่งสำเร็จยอดเยี่ยม!</Text>
                        </View>

                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>ค่าจัดส่งสุทธิ (หลังหัก 15%)</Text>
                                <Text style={styles.summaryValueGross}>+ ฿{(order.price * 0.85).toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>คะแนนสะสมที่ได้รับ</Text>
                                <Text style={styles.summaryValuePoints}>+ 5 Points</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => router.push('/(rider)')}
                        >
                            <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {order.status === 'cancelled' && (
                    <View style={styles.finishedBox}>
                        <Text style={styles.finishedText}>❌ งานนี้ถูกยกเลิกแล้ว</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: '#ef4444' },
    header: { padding: 24, paddingBottom: 16, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    mapContainer: { height: 250, width: '100%' },
    map: { width: '100%', height: '100%' },
    detailsCard: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
    priceContainer: { alignItems: 'center', marginBottom: 16 },
    priceLabel: { fontSize: 14, color: '#64748b', marginBottom: 4 },
    priceValue: { fontSize: 32, fontWeight: '800', color: '#10b981' },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    detailTextContainer: { marginLeft: 16, flex: 1 },
    detailLabel: { fontSize: 13, color: '#64748b', marginBottom: 2, fontWeight: '600' },
    detailValue: { fontSize: 15, color: '#334155', fontWeight: '500', lineHeight: 22 },
    packageBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
    boxTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    boxDetail: { fontSize: 14, color: '#475569', marginBottom: 4 },
    acceptButton: { backgroundColor: '#10b981', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    arriveButton: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    completeButton: { backgroundColor: '#8b5cf6', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    disabledButton: { backgroundColor: '#cbd5e1', shadowOpacity: 0, elevation: 0 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    finishedBox: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
    finishedText: { fontSize: 16, fontWeight: '600', color: '#475569' },
    contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    contactInfo: { flexDirection: 'row', alignItems: 'center' },
    contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    contactName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    contactSub: { fontSize: 13, color: '#64748b' },
    chatButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#a7f3d0' },
    summaryCard: { backgroundColor: '#ecfdf5', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#a7f3d0', alignItems: 'center', marginTop: 8 },
    summaryHeader: { alignItems: 'center', marginBottom: 20 },
    summaryTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginTop: 12 },
    summaryDetails: { width: '100%', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#475569' },
    summaryValueGross: { fontSize: 16, fontWeight: '700', color: '#10b981' },
    summaryValuePoints: { fontSize: 16, fontWeight: '700', color: '#f59e0b' },
    homeButton: { width: '100%', backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center' },
    homeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
