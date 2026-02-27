import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function RiderLayout() {
    const { logout } = useAuth();
    const router = useRouter();

    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                tabBarActiveTintColor: '#10b981', // Emerald green for rider
                tabBarStyle: { height: 60, paddingBottom: 10, backgroundColor: '#111827', borderTopColor: '#374151' },
                headerStyle: { backgroundColor: '#111827' },
                headerTintColor: '#f9fafb',
                headerTitle: '', // Hide default text title globally
                headerLeft: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                        <FontAwesome5 name="bolt" size={28} color="#fbbf24" style={{ marginRight: 8 }} />
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: '900', color: '#f8fafc', fontStyle: 'italic' }}>
                                Thunder<Text style={{ color: '#fbbf24' }}>Go</Text> Driver
                            </Text>
                        </View>
                    </View>
                ),
                headerRight: () => (
                    <TouchableOpacity onPress={() => router.push('/(rider)/profile' as any)} style={{ marginRight: 16 }}>
                        <FontAwesome5 name="user-circle" size={28} color="#fbbf24" />
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'หางาน',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'แผนที่ของฉัน',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-marker-radius" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="order-detail/[id]"
                options={{
                    title: 'รายละเอียดงาน',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'ประวัติการส่ง',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="history" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="chat/[orderId]"
                options={{
                    title: 'แชท',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'โปรไฟล์',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={20} color={color} />
                }}
            />
            <Tabs.Screen
                name="ranking"
                options={{
                    title: 'แรงกิ้ง',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="personal-info"
                options={{
                    title: 'ข้อมูลส่วนบุคคล',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="vehicles"
                options={{
                    title: 'จัดการยานพาหนะ',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="income"
                options={{
                    title: 'รายได้',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="security"
                options={{
                    title: 'ความปลอดภัย',
                    href: null // Hide from bottom tabs
                }}
            />
        </Tabs>
    );
}
