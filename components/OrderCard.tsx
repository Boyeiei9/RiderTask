import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Order } from '../services/orderService';

interface Props {
    order: Order;
    role: 'sender' | 'rider';
}

export default function OrderCard({ order, role }: Props) {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#eab308'; // yellow
            case 'accepted': return '#3b82f6'; // blue
            case 'delivering': return '#8b5cf6'; // purple
            case 'completed': return '#22c55e'; // green
            default: return '#64748b';
        }
    };

    const getVehicleIcon = (type: string) => {
        if (!type) return 'truck-outline';
        if (type.includes('มอเตอร์ไซค์')) return 'motorbike';
        if (type.includes('รถยนต์') || type.includes('เก๋ง')) return 'car';
        if (type.includes('กระบะ') || type.includes('กะบะ')) return 'truck-fast';
        return 'truck-outline';
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'กำลังรอคนขับ';
            case 'accepted': return 'คนขับรับงานแล้ว';
            case 'delivering': return 'กำลังจัดส่ง';
            case 'completed': return 'จัดส่งสำเร็จ';
            default: return status;
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/${role === 'sender' ? '(sender)' : '(rider)'}/order-detail/${order.id}`)}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.price}>฿{order.price.toFixed(2)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {getStatusText(order.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.locationContainer}>
                <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={20} color="#3b82f6" style={styles.icon} />
                    <View style={styles.addressBox}>
                        <Text style={styles.label}>รับของที่:</Text>
                        <Text style={styles.address} numberOfLines={2}>{order.origin.address}</Text>
                    </View>
                </View>

                <View style={styles.connector} />

                <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="flag-checkered" size={20} color="#ef4444" style={styles.icon} />
                    <View style={styles.addressBox}>
                        <Text style={styles.label}>ส่งไปที่:</Text>
                        <Text style={styles.address} numberOfLines={2}>{order.destination.address}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.dateText}>{new Date(order.createdAt).toLocaleDateString('th-TH')}</Text>
                <View style={styles.detailsRow}>
                    <MaterialCommunityIcons name={getVehicleIcon(order.vehicleType)} size={18} color="#fbbf24" />
                    <Text style={[styles.detailText, { color: '#fbbf24', fontWeight: 'bold' }]}>{order.vehicleType}</Text>
                    <MaterialCommunityIcons name="weight-kilogram" size={16} color="#64748b" style={{ marginLeft: 8 }} />
                    <Text style={styles.detailText}>{order.packageDetails.weight} kg</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#334155' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    price: { fontSize: 20, fontWeight: '700', color: '#f8fafc' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: '600' },
    locationContainer: { backgroundColor: '#0f172a', padding: 12, borderRadius: 12 },
    locationRow: { flexDirection: 'row', alignItems: 'flex-start' },
    icon: { marginTop: 2 },
    addressBox: { marginLeft: 12, flex: 1 },
    label: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
    address: { fontSize: 14, color: '#cbd5e1', fontWeight: '500' },
    connector: { width: 2, height: 20, backgroundColor: '#334155', marginLeft: 9, marginVertical: 4 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' },
    dateText: { fontSize: 12, color: '#94a3b8' },
    detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: { fontSize: 13, color: '#f8fafc' }
});
