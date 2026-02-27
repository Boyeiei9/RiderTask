import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { AnimatedRegion, Marker, Marker as MarkerAnimated } from 'react-native-maps';
import Skeleton from '../../../components/Skeleton';
import { getUserProfile } from '../../../services/authService';
import { db } from '../../../services/firebase';
import { cancelOrder, Order } from '../../../services/orderService';

export default function SenderOrderDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [riderInfo, setRiderInfo] = useState<any>(null);

    // Mock Live Tracking
    const riderLocation = useRef(new AnimatedRegion({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
    })).current;

    useEffect(() => {
        if (!id) return;

        const unsubscribe = onSnapshot(doc(db, 'orders', id as string), (doc) => {
            if (doc.exists()) {
                const data = { id: doc.id, ...doc.data() } as Order;
                setOrder(data);
                if (data.riderRating) {
                    setRating(data.riderRating);
                }

                // Initialize rider location to origin if just starting delivering
                if (data.status === 'delivering' && riderLocation.latitude._value === 0) {
                    riderLocation.setValue({
                        latitude: data.origin.latitude,
                        longitude: data.origin.longitude,
                        latitudeDelta: 0,
                        longitudeDelta: 0
                    });
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        if (order?.riderId) {
            getUserProfile(order.riderId).then(data => {
                if (data) setRiderInfo(data);
            }).catch(console.error);
        }
    }, [order?.riderId]);

    useEffect(() => {
        let interval: any;
        if (order?.status === 'delivering') {
            // Mock moving towards destination
            interval = setInterval(() => {
                const currentLat = riderLocation.latitude as unknown as { _value: number };
                const currentLng = riderLocation.longitude as unknown as { _value: number };

                const latDiff = order.destination.latitude - currentLat._value;
                const lngDiff = order.destination.longitude - currentLng._value;

                // Move 5% closer every 2 seconds
                riderLocation.timing({
                    latitude: currentLat._value + (latDiff * 0.05),
                    longitude: currentLng._value + (lngDiff * 0.05),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                    duration: 2000,
                    useNativeDriver: false
                } as any).start();

            }, 2000);
        }

        return () => clearInterval(interval);
    }, [order?.status]);

    const handleCancelOrder = () => {
        Alert.alert(
            'ยกเลิกรายการ',
            'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกรายการนี้?',
            [
                { text: 'ไม่', style: 'cancel' },
                {
                    text: 'ใช่, ยกเลิก',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await cancelOrder(id as string);
                        } catch (error) {
                            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถยกเลิกรายการได้');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const submitRating = async () => {
        if (rating === 0) {
            Alert.alert('แจ้งเตือน', 'กรุณาระบุคะแนนดาวก่อนกดยืนยัน');
            return;
        }
        try {
            setSubmittingRating(true);
            const orderRef = doc(db, 'orders', id as string);
            await updateDoc(orderRef, {
                riderRating: rating,
                riderFeedback: feedback
            });
            Alert.alert('สำเร็จ', 'ขอบคุณสำหรับคะแนนและคำติชม');
        } catch (error) {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งคะแนนได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Skeleton width={150} height={28} style={{ marginBottom: 8 }} />
                    <Skeleton width={200} height={16} />
                </View>
                <View style={[styles.statusCard, { paddingTop: 24 }]}>
                    <Skeleton width="100%" height={60} borderRadius={12} />
                </View>
                <View style={styles.mapContainer}>
                    <Skeleton width="100%" height="100%" borderRadius={0} />
                </View>
                <View style={styles.detailsCard}>
                    <Skeleton width={180} height={24} style={{ marginBottom: 20 }} />
                    <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                        <Skeleton width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
                        <View style={{ flex: 1 }}>
                            <Skeleton width={60} height={14} style={{ marginBottom: 8 }} />
                            <Skeleton width="90%" height={20} />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                        <Skeleton width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
                        <View style={{ flex: 1 }}>
                            <Skeleton width={60} height={14} style={{ marginBottom: 8 }} />
                            <Skeleton width="90%" height={20} />
                        </View>
                    </View>
                </View>
            </ScrollView>
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
                <Text style={styles.title}>รายละเอียดคำสั่งซื้อ</Text>
                <Text style={styles.orderId}>ID: {order.id}</Text>
            </View>

            <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>สถานะ:</Text>
                    <Text style={[
                        styles.statusValue,
                        order.status === 'pending' && { color: '#eab308' },
                        order.status === 'accepted' && { color: '#3b82f6' },
                        order.status === 'delivering' && { color: '#8b5cf6' },
                        order.status === 'completed' && { color: '#10b981' },
                        order.status === 'cancelled' && { color: '#ef4444' }
                    ]}>
                        {order.status === 'pending' ? 'กำลังรอคนขับ' :
                            order.status === 'accepted' ? 'คนขับรับงานแล้ว' :
                                order.status === 'delivering' ? 'กำลังจัดส่ง' :
                                    order.status === 'completed' ? 'จัดส่งสำเร็จ' :
                                        order.status === 'cancelled' ? 'ยกเลิกแล้ว' : order.status}
                    </Text>
                </View>
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
                    <Marker coordinate={{ latitude: order.origin.latitude, longitude: order.origin.longitude }} title="จุดรับพัสดุ" pinColor="blue" />
                    <Marker coordinate={{ latitude: order.destination.latitude, longitude: order.destination.longitude }} title="จุดส่งพัสดุ" pinColor="red" />

                    {order.status === 'delivering' && (
                        <MarkerAnimated
                            coordinate={riderLocation as any}
                            title="คนขับกำลังเดินทาง"
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.riderMarker}>
                                <MaterialCommunityIcons
                                    name={
                                        order.vehicleType?.includes('มอเตอร์ไซค์') ? 'motorbike' :
                                            order.vehicleType?.includes('รถยนต์') || order.vehicleType?.includes('เก๋ง') ? 'car' :
                                                order.vehicleType?.includes('กระบะ') || order.vehicleType?.includes('กะบะ') ? 'truck-fast' : 'truck-outline'
                                    }
                                    size={24}
                                    color="#1e293b"
                                />
                            </View>
                        </MarkerAnimated>
                    )}
                </MapView>
            </View>

            <View style={styles.detailsCard}>

                {/* Rider Info Section */}
                {['accepted', 'delivering', 'completed', 'cancelled'].includes(order.status) && order.riderId && (
                    <View style={styles.riderCard}>
                        <View style={styles.riderHeader}>
                            <View style={styles.riderAvatar}>
                                {riderInfo?.avatarUrl ? (
                                    <Image source={{ uri: riderInfo.avatarUrl }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                                ) : (
                                    <FontAwesome5 name="user-alt" size={24} color="#94a3b8" />
                                )}
                            </View>
                            <View style={styles.riderInfo}>
                                <Text style={styles.riderName}>{riderInfo ? riderInfo.name : 'กำลังโหลด...'} (คนขับ)</Text>
                                <Text style={styles.riderPlate}>{riderInfo?.riderProfile?.plate || 'ไม่ระบุ'} • {order.vehicleType}</Text>
                            </View>
                            <View style={styles.riderActions}>
                                <TouchableOpacity
                                    style={styles.chatButton}
                                    onPress={() => router.push(`/chat/${order.id}` as any)}
                                >
                                    <FontAwesome5 name="comment-dots" size={16} color="#451a03" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.callButton}>
                                    <FontAwesome5 name="phone-alt" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <Text style={styles.sectionTitle}>รายละเอียดการจัดส่ง</Text>

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker" size={24} color="#3b82f6" />
                    <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>ต้นทาง</Text>
                        <Text style={styles.detailValue}>{order.origin.address}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="flag-checkered" size={24} color="#ef4444" />
                    <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>ปลายทาง</Text>
                        <Text style={styles.detailValue}>{order.destination.address}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="package-variant-closed" size={24} color="#64748b" />
                    <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>รายละเอียดพัสดุ</Text>
                        <Text style={styles.detailValue}>{order.vehicleType} | น้ำหนัก {order.packageDetails.weight} kg</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="credit-card-outline" size={24} color="#10b981" />
                    <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>วิธีการชำระเงิน</Text>
                        <Text style={styles.detailValue}>{order.paymentMethod === 'wallet' ? 'กระเป๋าเงิน (Wallet)' : 'เงินสดปลายทาง'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {order.status === 'completed' && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="timer-outline" size={24} color="#f59e0b" />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>ระยะทาง & เวลาจริง (จำลอง)</Text>
                            <Text style={styles.detailValue}>ระยะทาง: {order.actualDistance || 5.2} กม.</Text>
                            <Text style={styles.dimensionText}>เวลาที่ใช้: {order.actualDuration || 15} นาที</Text>
                        </View>
                    </View>
                )}

                {order.status === 'completed' && <View style={styles.divider} />}

                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>ราคาสุทธิ</Text>
                    <Text style={styles.priceValue}>฿{order.price.toFixed(2)}</Text>
                </View>

                {order.status === 'pending' && (
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
                        <Text style={styles.cancelButtonText}>ยกเลิกรายการ</Text>
                    </TouchableOpacity>
                )}

                {/* Rating UI */}
                {order.status === 'completed' && !order.riderRating && (
                    <View style={styles.ratingSection}>
                        <Text style={styles.ratingTitle}>ให้คะแนนคนขับ</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <FontAwesome5
                                        name="star"
                                        size={32}
                                        color={star <= rating ? "#f59e0b" : "#e2e8f0"}
                                        solid={star <= rating}
                                        style={styles.starIcon}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.feedbackInput}
                            placeholder="เขียนคำชมเชยหรือติชมคนขับ (ไม่บังคับ)"
                            value={feedback}
                            onChangeText={setFeedback}
                            multiline
                            numberOfLines={3}
                        />
                        <TouchableOpacity
                            style={[styles.submitRatingButton, rating === 0 && styles.submitRatingButtonDisabled]}
                            onPress={submitRating}
                            disabled={submittingRating || rating === 0}
                        >
                            {submittingRating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitRatingText}>ส่งคะแนน</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Rated UI */}
                {order.riderRating != null && (
                    <View style={styles.ratingSection}>
                        <Text style={styles.ratingTitle}>คะแนนที่คุณให้</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FontAwesome5
                                    key={star}
                                    name="star"
                                    size={24}
                                    color={star <= order.riderRating! ? "#f59e0b" : "#e2e8f0"}
                                    solid={star <= order.riderRating!}
                                    style={styles.starIcon}
                                />
                            ))}
                        </View>
                        {!!order.riderFeedback && (
                            <Text style={styles.ratedFeedbackText}>"{order.riderFeedback}"</Text>
                        )}
                    </View>
                )}

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    errorText: { fontSize: 16, color: '#ef4444' },
    header: { padding: 24, paddingBottom: 16, backgroundColor: '#1e293b' },
    title: { fontSize: 24, fontWeight: '700', color: '#f8fafc' },
    orderId: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
    statusCard: { backgroundColor: '#1e293b', paddingHorizontal: 24, paddingBottom: 24 },
    statusRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
    statusLabel: { fontSize: 16, color: '#94a3b8', marginRight: 8 },
    statusValue: { fontSize: 18, fontWeight: '700' },
    mapContainer: { height: 250, width: '100%' },
    map: { width: '100%', height: '100%' },
    riderMarker: { width: 40, height: 40, backgroundColor: '#fbbf24', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0f172a', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    detailsCard: { backgroundColor: '#1e293b', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },

    // Rider Info Specific Styles
    riderCard: { backgroundColor: '#0f172a', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
    riderHeader: { flexDirection: 'row', alignItems: 'center' },
    riderAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    riderInfo: { flex: 1 },
    riderName: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
    riderPlate: { fontSize: 13, color: '#94a3b8' },
    riderActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    chatButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fbbf24', justifyContent: 'center', alignItems: 'center' },
    callButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 20 },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    detailTextContainer: { marginLeft: 16, flex: 1 },
    detailLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
    detailValue: { fontSize: 15, color: '#f8fafc', fontWeight: '500' },
    dimensionText: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#334155', marginVertical: 16 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceLabel: { fontSize: 16, color: '#f8fafc', fontWeight: '600' },
    priceValue: { fontSize: 24, fontWeight: '800', color: '#fbbf24' },
    cancelButton: {
        marginTop: 24,
        backgroundColor: '#7f1d1d',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    cancelButtonText: {
        color: '#fca5a5',
        fontSize: 16,
        fontWeight: 'bold'
    },

    // Rating System Styles
    ratingSection: { marginTop: 24, padding: 20, backgroundColor: '#fbbf2415', borderRadius: 16, alignItems: 'center' },
    ratingTitle: { fontSize: 16, fontWeight: '700', color: '#fbbf24', marginBottom: 16 },
    starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
    starIcon: { marginHorizontal: 4 },
    feedbackInput: { width: '100%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#fbbf2450', borderRadius: 12, padding: 12, fontSize: 14, color: '#f8fafc', textAlignVertical: 'top', minHeight: 80, marginBottom: 16 },
    submitRatingButton: { backgroundColor: '#fbbf24', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
    submitRatingButtonDisabled: { backgroundColor: '#b45309' },
    submitRatingText: { color: '#0f172a', fontSize: 16, fontWeight: '700' },
    ratedFeedbackText: { fontSize: 14, color: '#fbbf24', marginTop: 12, fontStyle: 'italic', textAlign: 'center' }
});
