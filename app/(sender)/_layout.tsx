import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

export default function SenderLayout() {
    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                tabBarActiveTintColor: '#fbbf24', // ThunderGo yellow
                tabBarInactiveTintColor: '#64748b',
                tabBarStyle: { height: 60, paddingBottom: 10, backgroundColor: '#1e293b', borderTopColor: '#334155' },
                headerStyle: { backgroundColor: '#1e293b' },
                headerTitle: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome5 name="bolt" size={24} color="#fbbf24" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#f8fafc', fontStyle: 'italic' }}>ThunderGo</Text>
                    </View>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'หน้าหลัก',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="map-marked-alt" size={20} color={color} />
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'รายการของฉัน',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="list-alt" size={22} color={color} />
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'ประวัติ',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="history" size={20} color={color} />
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
                name="create-order"
                options={{
                    title: 'สร้างรายการ',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="order-detail/[id]"
                options={{
                    title: 'รายละเอียด',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="chat/[orderId]"
                options={{
                    title: 'แชทกับคนขับ',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'กระเป๋าเงิน',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="ranking"
                options={{
                    title: 'แรงกิ้งและสิทธิพิเศษ',
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
                name="security"
                options={{
                    title: 'ความปลอดภัย',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="language"
                options={{
                    title: 'ภาษา (Language)',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="route-search"
                options={{
                    title: 'ค้นหาเส้นทาง',
                    href: null // Hide from bottom tabs
                }}
            />
            <Tabs.Screen
                name="map-picker"
                options={{
                    title: 'เลือกที่อยู่บนแผนที่',
                    href: null // Hide from bottom tabs
                }}
            />
        </Tabs>
    );
}
