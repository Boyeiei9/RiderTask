import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useAuth } from '../../hooks/useAuth';
import { useOrderStore } from '../../hooks/useOrderStore'; // Global state for location
import { createOrder } from '../../services/orderService';

export default function SenderHome() {
    const { userId } = useAuth();
    const router = useRouter();
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Context from Route Selector Flow
    const { origin, destination, clearOrderState } = useOrderStore();

    // Order form state
    const [weight, setWeight] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    // Initial Location (just to center the background map)
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pricing estimation (Simple logic)
    const [selectedVehicle, setSelectedVehicle] = useState<'motorcycle' | 'car' | 'pickup'>('motorcycle');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('cash');
    const [price, setPrice] = useState(0);

    const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('ข้อผิดพลาด', 'กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้ง');
                setLoadingLocation(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            setLoadingLocation(false);
        })();
    }, []);

    // Estimate price when weight, vehicle or locations change
    useEffect(() => {
        calculatePrice();
    }, [weight, selectedVehicle, origin, destination]);

    const calculatePrice = () => {
        let basePrice = selectedVehicle === 'motorcycle' ? 40 : selectedVehicle === 'car' ? 80 : 150;
        let numWeight = parseFloat(weight);

        if (!isNaN(numWeight)) {
            if (selectedVehicle === 'motorcycle') {
                if (numWeight >= 20) {
                    Alert.alert('น้ำหนักเกิน', 'รถจักรยานยนต์รับน้ำหนักได้สูงสุด 20 กก. ระบบจะเปลี่ยนเป็นรถยนต์อัตโนมัติ');
                    setSelectedVehicle('car');
                    return;
                }
                basePrice += numWeight * 5;
            } else if (selectedVehicle === 'car') {
                if (numWeight > 80) {
                    Alert.alert('น้ำหนักเกิน', 'รถยนต์รับน้ำหนักได้สูงสุด 80 กก. ระบบจะเปลี่ยนเป็นรถกระบะอัตโนมัติ');
                    setSelectedVehicle('pickup');
                    return;
                }
                basePrice += numWeight * 10;
            } else {
                basePrice += numWeight * 15;
            }
        }

        // Add distance factor if both origin and destination exist
        if (origin && destination) {
            basePrice += 50;
        }

        setPrice(basePrice);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Denied', 'Please allow camera access to take a photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };


    const handleCreateOrder = async () => {
        if (!origin || !destination) {
            Alert.alert('ข้อมูลไม่ครบ', 'กรุณาระบุจุดรับของและจุดส่งของ');
            return;
        }

        const numWeight = parseFloat(weight);
        if (isNaN(numWeight) || numWeight <= 0) {
            Alert.alert('ข้อมูลไม่ครบ', 'กรุณาระบุน้ำหนักให้ถูกต้อง');
            return;
        }

        setIsSubmitting(true);
        try {
            await createOrder({
                senderId: userId!,
                status: 'pending',
                origin: { latitude: origin.latitude, longitude: origin.longitude, address: origin.address },
                destination: { latitude: destination.latitude, longitude: destination.longitude, address: destination.address },
                packageDetails: { weight: numWeight },
                vehicleType: selectedVehicle === 'motorcycle' ? 'รถมอเตอร์ไซค์' : selectedVehicle === 'car' ? 'รถยนต์' : 'รถกระบะ',
                paymentMethod: paymentMethod,
                price: price,
                imageUrl: imageUri || null,
                createdAt: new Date().toISOString()
            });

            Alert.alert('สำเร็จ', 'สร้างรายการส่งของเรียบร้อยแล้ว', [
                {
                    text: 'ตกลง', onPress: () => {
                        clearOrderState();
                        setWeight('');
                        setImageUri(null);
                        bottomSheetRef.current?.collapse();
                        router.push('/(sender)/orders' as any);
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างรายการได้ ลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingLocation) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fbbf24" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>กำลังค้นหาตำแหน่งของคุณ...</Text>
            </View>
        );
    }

    const initialRegion = {
        latitude: location?.coords.latitude || 13.7563,
        longitude: location?.coords.longitude || 100.5018,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={initialRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {/* Only show markers if they exist in state */}
                    {origin && (
                        <Marker coordinate={{ latitude: origin.latitude, longitude: origin.longitude }} title="จุดรับของ" pinColor="#3b82f6" />
                    )}
                    {destination && (
                        <Marker coordinate={{ latitude: destination.latitude, longitude: destination.longitude }} title="จุดส่งของ" pinColor="#f97316" />
                    )}
                </MapView>
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                enablePanDownToClose={false}
                backgroundStyle={styles.bottomSheetBackground}
            >
                <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>ส่งของใหม่</Text>

                    {/* Navigation to Route Search */}
                    <TouchableOpacity
                        style={styles.routeBox}
                        onPress={() => router.push('/(sender)/route-search')}
                    >
                        <View style={styles.routeItem}>
                            <View style={styles.dotOrigin} />
                            <Text style={[styles.routeText, !origin && styles.placeholderText]} numberOfLines={1}>
                                {origin ? origin.address : 'ระบุจุดรับของ'}
                            </Text>
                        </View>
                        <View style={styles.routeDivider} />
                        <View style={styles.routeItem}>
                            <View style={styles.dotDest} />
                            <Text style={[styles.routeText, !destination && styles.placeholderText]} numberOfLines={1}>
                                {destination ? destination.address : 'จุดหมายปลายทาง'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>น้ำหนัก (กิโลกรัม)</Text>
                        <TextInput
                            style={styles.input}
                            value={weight}
                            onChangeText={setWeight}
                            placeholder="เช่น 1.5"
                            placeholderTextColor="#64748b"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ประเภทรถ</Text>
                        <View style={styles.vehicleContainer}>
                            <TouchableOpacity
                                style={[styles.vehicleCard, selectedVehicle === 'motorcycle' && styles.vehicleCardActive]}
                                onPress={() => setSelectedVehicle('motorcycle')}
                            >
                                <FontAwesome5 name="motorcycle" size={24} color={selectedVehicle === 'motorcycle' ? '#fbbf24' : '#64748b'} />
                                <Text style={[styles.vehicleText, selectedVehicle === 'motorcycle' && styles.vehicleTextActive]}>มอเตอร์ไซค์</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.vehicleCard, selectedVehicle === 'car' && styles.vehicleCardActive]}
                                onPress={() => setSelectedVehicle('car')}
                            >
                                <FontAwesome5 name="car" size={24} color={selectedVehicle === 'car' ? '#fbbf24' : '#64748b'} />
                                <Text style={[styles.vehicleText, selectedVehicle === 'car' && styles.vehicleTextActive]}>รถยนต์</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.vehicleCard, selectedVehicle === 'pickup' && styles.vehicleCardActive]}
                                onPress={() => setSelectedVehicle('pickup')}
                            >
                                <FontAwesome5 name="truck-pickup" size={24} color={selectedVehicle === 'pickup' ? '#fbbf24' : '#64748b'} />
                                <Text style={[styles.vehicleText, selectedVehicle === 'pickup' && styles.vehicleTextActive]}>รถกระบะ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ช่องทางการชำระเงิน</Text>
                        <View style={styles.paymentMethodContainer}>
                            <TouchableOpacity
                                style={[styles.paymentMethodBtn, paymentMethod === 'cash' && styles.paymentMethodActive]}
                                onPress={() => setPaymentMethod('cash')}
                            >
                                <FontAwesome5 name="money-bill" size={20} color={paymentMethod === 'cash' ? '#b45309' : '#64748b'} />
                                <Text style={[styles.paymentMethodText, paymentMethod === 'cash' && styles.paymentMethodTextActive]}>เงินสด</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.paymentMethodBtn, paymentMethod === 'wallet' && styles.paymentMethodActive]}
                                onPress={() => setPaymentMethod('wallet')}
                            >
                                <FontAwesome5 name="credit-card" size={20} color={paymentMethod === 'wallet' ? '#b45309' : '#64748b'} />
                                <Text style={[styles.paymentMethodText, paymentMethod === 'wallet' && styles.paymentMethodTextActive]}>เครดิต/Wallet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>รูปภาพพัสดุ (ถ้ามี)</Text>
                        {imageUri ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.repickButton} onPress={pickImage}>
                                    <Ionicons name="camera-reverse" size={20} color="#f8fafc" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity style={[styles.imagePickerButton, { flex: 1 }]} onPress={takePhoto}>
                                    <Ionicons name="camera" size={32} color="#64748b" />
                                    <Text style={styles.imagePlaceholderText}>ถ่ายรูป</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.imagePickerButton, { flex: 1 }]} onPress={pickImage}>
                                    <Ionicons name="image" size={32} color="#64748b" />
                                    <Text style={styles.imagePlaceholderText}>เลือกจากคลัง</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryLabel}>ค่าจัดส่งโดยประมาณ</Text>
                        <Text style={styles.summaryValue}>฿{price}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                        disabled={isSubmitting}
                        onPress={handleCreateOrder}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#0f172a" />
                        ) : (
                            <Text style={styles.submitBtnText}>ยืนยันการส่งของ</Text>
                        )}
                    </TouchableOpacity>
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    mapContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    routeBox: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    routeItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dotOrigin: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3b82f6',
        marginRight: 10,
    },
    dotDest: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#f97316',
        marginRight: 10,
    },
    routeDivider: {
        width: 2,
        height: 20,
        backgroundColor: '#334155',
        marginLeft: 4,
        marginVertical: 4,
    },
    routeText: {
        color: '#f8fafc',
        fontSize: 16,
        flex: 1,
    },
    placeholderText: {
        color: '#64748b',
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    map: { width: '100%', height: '100%' },
    bottomSheetBackground: {
        borderRadius: 30,
        backgroundColor: '#0f172a',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        elevation: 10,
    },
    sheetContent: { padding: 25, paddingBottom: 50 },
    sheetTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#f8fafc' },
    inputGroup: { marginBottom: 20 },
    label: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        color: '#f8fafc',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155'
    },
    vehicleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    vehicleCard: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    vehicleCardActive: {
        backgroundColor: '#fffbeb',
        borderColor: '#fbbf24',
    },
    vehicleText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    vehicleTextActive: {
        color: '#b45309',
        fontWeight: '600',
    },
    pickerContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155'
    },
    picker: { color: '#f8fafc', backgroundColor: 'transparent' },
    imagePickerButton: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#334155',
        borderStyle: 'dashed',
        height: 150
    },
    imagePreviewContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        height: 200,
        borderWidth: 1,
        borderColor: '#334155'
    },
    previewImage: { width: '100%', height: '100%' },
    repickButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 8,
        padding: 8
    },
    imagePlaceholderText: { color: '#64748b', fontSize: 16, fontWeight: '600', marginTop: 10 },
    summaryContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 20,
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fbbf2430'
    },
    summaryLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
    summaryValue: { color: '#fbbf24', fontSize: 28, fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#fbbf24', padding: 16, borderRadius: 12, alignItems: 'center' },
    submitBtnDisabled: { backgroundColor: '#fcd34d' },
    submitBtnText: { color: '#0f172a', fontSize: 18, fontWeight: 'bold' },

    paymentMethodContainer: { flexDirection: 'row', gap: 12 },
    paymentMethodBtn: { flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#334155' },
    paymentMethodActive: { backgroundColor: '#fffbeb', borderColor: '#fbbf24' },
    paymentMethodText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
    paymentMethodTextActive: { color: '#b45309' }
});
