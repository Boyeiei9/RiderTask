import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { useOrderStore } from '../../hooks/useOrderStore';

export default function MapPickerScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type: 'origin' | 'destination' }>();
    const { setOrigin, setDestination } = useOrderStore();

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [pinLocation, setPinLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [address, setAddress] = useState<string>('กำลังค้นหาตําแหน่ง...');
    const [loading, setLoading] = useState(true);
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('ข้อผิดพลาด', 'กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้ง');
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            // Initial pin
            setPinLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });
            setLoading(false);
        })();
    }, []);

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        setIsFetchingAddress(true);
        try {
            const geocodeCache = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geocodeCache.length > 0) {
                const place = geocodeCache[0];
                const parts = [place.name, place.street, place.district, place.subregion, place.city, place.region].filter(Boolean);
                const finalAddress = parts.join(', ');
                if (finalAddress.length > 0) {
                    setAddress(finalAddress);
                    return;
                }
            }
            throw new Error('Fallback to OSM');
        } catch (error) {
            try {
                // Fallback to OSM Nominatim for better Emulator support outside of Google API restrictions
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`, {
                    headers: {
                        'User-Agent': 'DeliveryGoApp/1.0 (Contact: local@localhost)'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.display_name) {
                        setAddress(data.display_name);
                        return;
                    }
                }
            } catch (fallbackError) {
                // Ignore fallback error
            }
            setAddress(`พิกัด: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
            setIsFetchingAddress(false);
        }
    };

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastGeocodedRegion = useRef<{ latitude: number, longitude: number } | null>(null);

    const handleRegionChangeComplete = (region: any) => {
        // Prevent floating point jitter from causing infinite loops on Android MapView re-renders
        if (lastGeocodedRegion.current) {
            const latDiff = Math.abs(lastGeocodedRegion.current.latitude - region.latitude);
            const lngDiff = Math.abs(lastGeocodedRegion.current.longitude - region.longitude);
            if (latDiff < 0.0001 && lngDiff < 0.0001) {
                return; // Map barely moved, ignore
            }
        }

        lastGeocodedRegion.current = { latitude: region.latitude, longitude: region.longitude };
        setPinLocation({ latitude: region.latitude, longitude: region.longitude });
        setAddress('กำลังดึงข้อมูลที่อยู่...');

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchAddressFromCoords(region.latitude, region.longitude);
        }, 1500); // 1.5 seconds debounce to avoid strict OSM/Google map rate limits
    };

    const handleConfirm = () => {
        if (!pinLocation || !address) return;

        const placeData = {
            address,
            latitude: pinLocation.latitude,
            longitude: pinLocation.longitude
        };

        if (type === 'destination') {
            setDestination(placeData);
        } else {
            setOrigin(placeData);
        }

        // Navigate back to Route Search or Sender Home
        router.back();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fbbf24" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>กำลังเตรียมแผนที่...</Text>
            </View>
        );
    }

    const initialRegion = {
        latitude: location?.coords.latitude || 13.7563,
        longitude: location?.coords.longitude || 100.5018,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    เลือก{type === 'destination' ? 'จุดหมายปลายทาง' : 'จุดรับของ'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={initialRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    onRegionChangeComplete={handleRegionChangeComplete}
                />

                {/* Fixed Center Pin */}
                <View style={styles.centerPinContainer} pointerEvents="none">
                    <FontAwesome5 name="map-marker-alt" size={48} color={type === 'destination' ? '#f97316' : '#3b82f6'} style={styles.pinIcon} />
                    <View style={styles.pinShadow} />
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.addressContainer}>
                    <View style={[styles.iconBox, { backgroundColor: type === 'destination' ? '#f9731620' : '#3b82f620' }]}>
                        <FontAwesome5 name="map-marker-alt" size={20} color={type === 'destination' ? '#f97316' : '#3b82f6'} />
                    </View>
                    <View style={styles.addressTextContainer}>
                        <Text style={styles.addressLabel}>รายละเอียดที่ตั้ง</Text>
                        <Text style={styles.addressText} numberOfLines={2}>
                            {address}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.confirmButton, isFetchingAddress && styles.confirmButtonDisabled]}
                    onPress={handleConfirm}
                    disabled={isFetchingAddress}
                >
                    {isFetchingAddress ? (
                        <ActivityIndicator color="#0f172a" />
                    ) : (
                        <Text style={styles.confirmButtonText}>ยืนยันตำแหน่งนี้</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#ffffff',
        elevation: 4,
        zIndex: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    centerPinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -15, // Roughly half the icon width
        marginTop: -48, // Full icon height so point is at center
        zIndex: 10,
        alignItems: 'center',
    },
    pinIcon: {
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    pinShadow: {
        width: 10,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 5,
        marginTop: -4,
        transform: [{ scaleX: 2 }],
    },
    footer: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        marginTop: -20,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f1f5f9',
        padding: 16,
        borderRadius: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    addressTextContainer: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        lineHeight: 22,
    },
    confirmButton: {
        backgroundColor: '#fbbf24',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        opacity: 0.7,
    },
    confirmButtonText: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
