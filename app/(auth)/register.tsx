import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { registerUser } from '../../services/authService';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'sender' | 'rider'>('sender');

    // Rider specific fields
    const [plate, setPlate] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [vehicleYear, setVehicleYear] = useState('');

    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const vehicleTypes = ['รถมอเตอร์ไซค์', 'รถยนต์', 'รถกระบะ'];

    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { loginWithLocalUser } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (role === 'rider' && (!plate || !vehicleType || !vehicleYear)) {
            Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลรถสำหรับคนขับให้ครบถ้วน');
            return;
        }

        try {
            setLoading(true);
            const riderData = { plate, vehicleType, vehicleYear };
            const { role: userRole, user } = await registerUser(email, password, name, role, riderData);
            loginWithLocalUser(userRole, user.uid);

            if (userRole === 'sender') router.replace('/(sender)');
            else router.replace('/(rider)');
        } catch (error: any) {
            Alert.alert('สมัครสมาชิกไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการสมัคร');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <FontAwesome5 name="bolt" size={36} color="#fbbf24" style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: 32, fontWeight: '800', color: '#f8fafc', fontStyle: 'italic' }}>Thunder<Text style={{ color: '#fbbf24' }}>Go</Text></Text>
                </View>
                <Text style={styles.title}>สร้างบัญชีใหม่</Text>
                <Text style={styles.subtitle}>เข้าร่วมเป็นส่วนหนึ่งของ ThunderGo</Text>
            </View>

            <View style={styles.roleContainer}>
                <Text style={styles.label}>เลือกประเภทผู้ใช้งาน</Text>
                <View style={styles.roleRow}>
                    <TouchableOpacity
                        style={[styles.roleCard, role === 'sender' && styles.roleCardActive]}
                        onPress={() => setRole('sender')}
                    >
                        <Text style={[styles.roleText, role === 'sender' && styles.roleTextActive]}>📦 ผู้ส่งของ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleCard, role === 'rider' && styles.roleCardActive]}
                        onPress={() => setRole('rider')}
                    >
                        <Text style={[styles.roleText, role === 'rider' && styles.roleTextActive]}>🛵 คนขับรถ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>ชื่อ - นามสกุล</Text>
                <TextInput
                    style={styles.input}
                    placeholder="นาย สมมติ ทดสอบ"
                    placeholderTextColor="#64748b"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>อีเมล</Text>
                <TextInput
                    style={styles.input}
                    placeholder="example@email.com"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {role === 'rider' && (
                    <View style={styles.riderSection}>
                        <Text style={styles.sectionHeader}>ข้อมูลยานพาหนะ (สำหรับคนขับ)</Text>

                        <View style={{ zIndex: 1000 }}>
                            <Text style={styles.label}>ประเภทรถ</Text>
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center', marginTop: 8 }]}
                                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                            >
                                <Text style={{ color: vehicleType ? '#f8fafc' : '#64748b', fontSize: 16 }}>
                                    {vehicleType || 'เลือกประเภทรถ'}
                                </Text>
                            </TouchableOpacity>
                            {showTypeDropdown && (
                                <View style={styles.dropdown}>
                                    {vehicleTypes.map((vType) => (
                                        <TouchableOpacity
                                            key={vType}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setVehicleType(vType);
                                                setShowTypeDropdown(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>{vType}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <Text style={styles.label}>ทะเบียนรถ</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1กข 1234 กทม."
                            placeholderTextColor="#64748b"
                            value={plate}
                            onChangeText={setPlate}
                        />

                        <Text style={styles.label}>ปีรถจดทะเบียน</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="2022"
                            placeholderTextColor="#64748b"
                            keyboardType="numeric"
                            value={vehicleYear}
                            onChangeText={setVehicleYear}
                        />
                        <Text style={styles.helperText}>* ใบอนุญาตขับขี่สามารถอัปโหลดในแอปภายหลังได้</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>ลงทะเบียน</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.footer}>
                    <Text style={styles.footerText}>มีบัญชีอยู่แล้ว? <Text style={styles.linkText}>เข้าสู่ระบบ</Text></Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    content: { padding: 24, paddingVertical: 50 },
    header: { marginBottom: 30 },
    title: { fontSize: 32, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#94a3b8' },
    roleContainer: { marginBottom: 24 },
    roleRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
    roleCard: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 2, borderColor: '#334155', alignItems: 'center', backgroundColor: '#1e293b' },
    roleCardActive: { borderColor: '#fbbf24', backgroundColor: '#0f172a' },
    roleText: { fontSize: 16, fontWeight: '600', color: '#94a3b8' },
    roleTextActive: { color: '#fbbf24' },
    form: { gap: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: -8, marginLeft: 4 },
    input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155', fontSize: 16 },
    button: { backgroundColor: '#fbbf24', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#fbbf24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    buttonText: { color: '#0f172a', fontSize: 18, fontWeight: '600' },
    footer: { marginTop: 20, alignItems: 'center' },
    footerText: { color: '#94a3b8', fontSize: 15 },
    linkText: { color: '#fbbf24', fontWeight: '600' },
    riderSection: { marginTop: 8, padding: 16, borderRadius: 12, backgroundColor: '#1e293b', gap: 12, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
    sectionHeader: { color: '#f8fafc', fontWeight: '700', fontSize: 16, marginBottom: 4 },
    helperText: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic', marginTop: 4 },
    dropdown: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginTop: 4, position: 'absolute', top: 85, left: 0, right: 0, zIndex: 1000, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
    dropdownItemText: { color: '#f8fafc', fontSize: 16 }
});
