import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';

export default function RiderMap() {
    const { location, address } = useLocation();

    if (!location) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>กำลังค้นหาตำแหน่งของคุณ...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ตำแหน่งปัจจุบัน</Text>
                <Text style={styles.subtitle} numberOfLines={2}>{address || 'กำลังระบุที่อยู่...'}</Text>
            </View>

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                followsUserLocation={true}
            >
                <Marker
                    coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    }}
                    title="คุณอยู่ที่นี่"
                />
                <Circle
                    center={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    }}
                    radius={2000}
                    fillColor="rgba(16, 185, 129, 0.1)"
                    strokeColor="rgba(16, 185, 129, 0.5)"
                    strokeWidth={2}
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, color: '#64748b', fontSize: 16 },
    header: { padding: 20, zIndex: 1, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
    title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    map: { flex: 1 }
});
