import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import { VEHICLE_TYPES, calculatePrice } from '../../constants/vehicleTypes';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { createOrder } from '../../services/orderService';

export default function CreateOrderScreen() {
    const router = useRouter();
    const { location, address: autoAddress } = useLocation();
    const { userId } = useAuth();

    const [origin, setOrigin] = useState({ latitude: 13.7563, longitude: 100.5018, address: 'กรุงเทพมหานคร' });
    const [destination, setDestination] = useState({ latitude: 13.8000, longitude: 100.5500, address: 'ระบุปลายทาง (ทดสอบ)' });

    const [weight, setWeight] = useState('');
    const [width, setWidth] = useState('');
    const [length, setLength] = useState('');
    const [height, setHeight] = useState('');

    const [vehicleId, setVehicleId] = useState(VEHICLE_TYPES[0].id);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('cash');
    const [loading, setLoading] = useState(false);

    // Bottom Sheet references
    const bottomSheetRef = useRef<BottomSheet>(null);
    const handleOpenBottomSheet = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    useEffect(() => {
        if (location) {
            setOrigin({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                address: autoAddress || 'ตำแหน่งปัจจุบันของคุณ'
            });
        }
    }, [location, autoAddress]);

    // Mock distance calculation in km
    const getDistanceKm = () => {
        // In real app, use Google Distance Matrix API
        return 15; // mock distance 15 km
    };

    // Auto-select minimum vehicle based on weight
    useEffect(() => {
        const w = Number(weight) || 0;
        if (w > 80) setVehicleId('pickup');
        else if (w >= 20) setVehicleId('car');
        else setVehicleId('motorcycle');
    }, [weight]);

    const currentPrice = calculatePrice(vehicleId, getDistanceKm());

    const handleSubmit = async () => {
        if (!weight || !width || !length || !height) {
            Alert.alert('กรุณากรอกข้อมูล', 'โปรดระบุรายละเอียดพัสดุให้ครบถ้วน');
            return;
        }
        if (!userId) return;

        try {
            setLoading(true);
            const vehicleName = VEHICLE_TYPES.find(v => v.id === vehicleId)?.title || 'รถมอเตอร์ไซค์';

            const orderId = await createOrder({
                senderId: userId,
                status: 'pending',
                origin,
                destination,
                packageDetails: {
                    weight: Number(weight),
                    width: width ? Number(width) : null,
                    length: length ? Number(length) : null,
                    height: height ? Number(height) : null,
                },
                vehicleType: vehicleName,
                paymentMethod: paymentMethod,
                price: currentPrice,
                createdAt: new Date().toISOString()
            });

            Alert.alert('สำเร็จ', 'สร้างรายการส่งของเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => router.push('/(sender)') }
            ]);
        } catch (e) {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้างรายการได้ กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>ต้นทาง & ปลายทาง</Text>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: origin.latitude,
                            longitude: origin.longitude,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        }}
                    >
                        <Marker coordinate={{ latitude: origin.latitude, longitude: origin.longitude }} title="ต้นทาง" pinColor="blue" />
                        <Marker coordinate={{ latitude: destination.latitude, longitude: destination.longitude }} title="ปลายทาง" pinColor="red" />
                    </MapView>
                </View>

                <Text style={styles.sectionTitle}>รายละเอียดพัสดุ (cm / kg)</Text>
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>น้ำหนัก (kg)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="0" placeholderTextColor="#9ca3af" />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>กว้าง (cm)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={width} onChangeText={setWidth} placeholder="0" placeholderTextColor="#9ca3af" />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ยาว (cm)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={length} onChangeText={setLength} placeholder="0" placeholderTextColor="#9ca3af" />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>สูง (cm)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} placeholder="0" placeholderTextColor="#9ca3af" />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ประเภทรถที่เลือก</Text>
                <TouchableOpacity
                    style={styles.selectedVehicleCard}
                    onPress={handleOpenBottomSheet}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons
                        name={vehicleId === 'motorcycle' ? 'motorbike' : vehicleId === 'car' ? 'car' : vehicleId === 'pickup' ? 'truck-fast' : 'truck'}
                        size={40}
                        color="#facc15"
                    />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.selectedVehicleTitle}>
                            {VEHICLE_TYPES.find(v => v.id === vehicleId)?.title}
                        </Text>
                        <Text style={styles.selectedVehicleDetail}>
                            เปลี่ยนประเภทรถพัสดุ
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ช่องทางการชำระเงิน</Text>
                <View style={styles.paymentMethodContainer}>
                    <TouchableOpacity
                        style={[styles.paymentMethodBtn, paymentMethod === 'cash' && styles.paymentMethodActive]}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <MaterialCommunityIcons name="cash" size={24} color={paymentMethod === 'cash' ? '#1f2937' : '#f9fafb'} />
                        <Text style={[styles.paymentMethodText, paymentMethod === 'cash' && styles.paymentMethodTextActive]}>เงินสดปลายทาง</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.paymentMethodBtn, paymentMethod === 'wallet' && styles.paymentMethodActive]}
                        onPress={() => setPaymentMethod('wallet')}
                    >
                        <MaterialCommunityIcons name="credit-card-outline" size={24} color={paymentMethod === 'wallet' ? '#1f2937' : '#f9fafb'} />
                        <Text style={[styles.paymentMethodText, paymentMethod === 'wallet' && styles.paymentMethodTextActive]}>บัตรเครดิต / กระเป๋าเงิน</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>ระยะทางโดยประมาณ</Text>
                        <Text style={styles.summaryValue}>15 กม.</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabelTotal}>ราคารวม</Text>
                        <Text style={styles.summaryValueTotal}>฿{currentPrice.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#111827" />
                        ) : (
                            <Text style={styles.submitButtonText}>ยืนยันการส่งพัสดุ</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Vehicle Selection Bottom Sheet */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['50%', '70%']}
                enablePanDownToClose={true}
                backgroundStyle={{ backgroundColor: '#1f2937' }}
                handleIndicatorStyle={{ backgroundColor: '#4b5563' }}
            >
                <BottomSheetView style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>เลือกประเภทรถ</Text>
                    <View style={styles.vehicleContainer}>
                        {VEHICLE_TYPES.map(vehicle => (
                            <TouchableOpacity
                                key={vehicle.id}
                                style={[styles.vehicleCard, vehicleId === vehicle.id && styles.vehicleCardActive]}
                                onPress={() => {
                                    setVehicleId(vehicle.id);
                                    bottomSheetRef.current?.close();
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={styles.vehicleHeader}>
                                    <View style={styles.vehicleIconContainer}>
                                        <MaterialCommunityIcons
                                            name={vehicle.id === 'motorcycle' ? 'motorbike' : vehicle.id === 'car' ? 'car' : vehicle.id === 'pickup' ? 'truck-fast' : 'truck'}
                                            size={32}
                                            color={vehicleId === vehicle.id ? '#1f2937' : '#f9fafb'}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.vehicleTitle, vehicleId === vehicle.id && styles.vehicleTitleActive]}>{vehicle.title}</Text>
                                        <Text style={styles.vehicleDetail}>รับน้ำหนักสูงสุด {vehicle.maxWeight} kg</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.vehiclePrice, vehicleId === vehicle.id && styles.vehicleTitleActive]}>฿{calculatePrice(vehicle.id, getDistanceKm()).toFixed(2)}</Text>
                                        <Text style={styles.priceDetailText}>ราคาประเมิน</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    content: { padding: 16, paddingBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#facc15', marginBottom: 16 },
    mapContainer: { height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#374151' },
    map: { width: '100%', height: '100%' },
    inputRow: { flexDirection: 'row', gap: 12 },
    inputGroup: { flex: 1 },
    label: { fontSize: 13, color: '#9ca3af', marginBottom: 4, fontWeight: '500' },
    input: { backgroundColor: '#1f2937', color: '#f9fafb', borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 12, fontSize: 15 },

    selectedVehicleCard: { backgroundColor: '#1f2937', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#374151', flexDirection: 'row', alignItems: 'center' },
    selectedVehicleTitle: { fontSize: 18, fontWeight: '700', color: '#f9fafb' },
    selectedVehicleDetail: { fontSize: 13, color: '#facc15', marginTop: 4 },

    sheetContent: { padding: 24, flex: 1 },
    sheetTitle: { fontSize: 20, fontWeight: '700', color: '#f9fafb', marginBottom: 20, textAlign: 'center' },
    vehicleContainer: { gap: 16 },
    vehicleCard: { backgroundColor: '#374151', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderColor: 'transparent' },
    vehicleCardActive: { borderColor: '#facc15', backgroundColor: '#facc15' },
    vehicleHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    vehicleIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    vehicleTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
    vehicleTitleActive: { color: '#1f2937' },
    vehicleDetail: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
    vehiclePrice: { fontSize: 18, fontWeight: '800', color: '#34d399' },
    priceDetailText: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
    summaryContainer: { marginTop: 32, backgroundColor: '#1f2937', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 14, color: '#9ca3af' },
    summaryValue: { fontSize: 14, fontWeight: '600', color: '#f9fafb' },
    summaryLabelTotal: { fontSize: 18, fontWeight: '700', color: '#facc15' },
    summaryValueTotal: { fontSize: 24, fontWeight: '800', color: '#facc15' },
    submitButton: { backgroundColor: '#facc15', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    submitButtonText: { color: '#111827', fontSize: 18, fontWeight: '700' },

    paymentMethodContainer: { flexDirection: 'row', gap: 12 },
    paymentMethodBtn: { flex: 1, backgroundColor: '#374151', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#4b5563' },
    paymentMethodActive: { backgroundColor: '#facc15', borderColor: '#facc15' },
    paymentMethodText: { color: '#f9fafb', fontSize: 14, fontWeight: '600' },
    paymentMethodTextActive: { color: '#1f2937' }
});
