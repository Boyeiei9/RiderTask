import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { loginUser } from '../../services/authService';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { loginWithLocalUser } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            setLoading(true);
            const { role, user } = await loginUser(email, password);
            loginWithLocalUser(role, user.uid);

            if (role === 'sender') router.replace('/(sender)');
            else router.replace('/(rider)');
        } catch (error: any) {
            Alert.alert('เข้าสู่ระบบล้มเหลว', error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <FontAwesome5 name="bolt" size={36} color="#fbbf24" style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: 32, fontWeight: '800', color: '#f8fafc', fontStyle: 'italic' }}>Thunder<Text style={{ color: '#fbbf24' }}>Go</Text></Text>
                </View>
                <Text style={styles.title}>ยินดีต้อนรับกลับมา</Text>
                <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อดำเนินการต่อ</Text>
            </View>

            <View style={styles.form}>
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

                <Text style={styles.label}>รหัสผ่าน</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.footer}>
                    <Text style={styles.footerText}>ยังไม่มีบัญชีใช่หรือไม่? <Text style={styles.linkText}>สมัครสมาชิก</Text></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
    header: { marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#94a3b8' },
    form: { gap: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: -8, marginLeft: 4 },
    input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155', fontSize: 16 },
    button: { backgroundColor: '#fbbf24', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#fbbf24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    buttonText: { color: '#0f172a', fontSize: 18, fontWeight: '600' },
    footer: { marginTop: 20, alignItems: 'center' },
    footerText: { color: '#94a3b8', fontSize: 15 },
    linkText: { color: '#fbbf24', fontWeight: '600' }
});
