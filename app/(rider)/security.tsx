import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, sendPasswordReset } from '../../services/authService';

export default function RiderSecurityScreen() {
    const { userId } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        if (!userId) return;
        try {
            const data = await getUserProfile(userId);
            if (data) setEmail(data.email || '');
        } catch (error) {
            console.error("Error loading email:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        Alert.alert(
            'รีเซ็ตรหัสผ่าน',
            `ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมล:\n${email}\n\nคุณแน่ใจหรือไม่?`,
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ส่งลิงก์',
                    style: 'destructive',
                    onPress: async () => {
                        setSending(true);
                        try {
                            await sendPasswordReset(email);
                            Alert.alert('สำเร็จ', 'ระบบได้ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ');
                        } catch (error: any) {
                            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้');
                        } finally {
                            setSending(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(rider)/profile' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#f9fafb" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ความปลอดภัย</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed" size={40} color="#facc15" />
                    </View>
                    <Text style={styles.sectionTitle}>เปลี่ยนรหัสผ่าน</Text>
                    <Text style={styles.sectionDesc}>
                        เพื่อความปลอดภัย เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่อีเมลที่ลงทะเบียนไว้
                    </Text>

                    <TouchableOpacity
                        style={[styles.actionButton, sending && styles.actionButtonDisabled]}
                        onPress={handlePasswordReset}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator color="#111827" />
                        ) : (
                            <>
                                <Ionicons name="mail" size={20} color="#111827" style={{ marginRight: 8 }} />
                                <Text style={styles.actionButtonText}>ส่งลิงก์รีเซ็ตรหัสผ่าน</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={[styles.iconContainer, { backgroundColor: '#3b82f620' }]}>
                        <Ionicons name="mail-unread" size={40} color="#60a5fa" />
                    </View>
                    <Text style={styles.sectionTitle}>การเปลี่ยนอีเมล</Text>
                    <Text style={styles.sectionDesc}>
                        อีเมลปัจจุบันของคุณคือ {email}
                        {'\n\n'}
                        เนื่องจากเหตุผลด้านความปลอดภัย การเปลี่ยนอีเมลจำเป็นต้องได้รับการยืนยันหลายขั้นตอน หากคุณต้องการเปลี่ยนอีเมล กรุณาติดต่อฝ่ายสนับสนุน
                    </Text>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => Alert.alert('ติดต่อฝ่ายสนับสนุน', 'กรุณาส่งอีเมลไปที่ support@deliverygo.com เพื่อขอเปลี่ยนที่อยู่อีเมล')}
                    >
                        <Text style={styles.secondaryButtonText}>ติดต่อฝ่ายสนับสนุน</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#1f2937' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#f9fafb' },
    content: { padding: 20 },
    section: { backgroundColor: '#1f2937', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#374151' },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(250, 204, 21, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(250, 204, 21, 0.3)' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#f9fafb', marginBottom: 10 },
    sectionDesc: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    actionButton: { flexDirection: 'row', backgroundColor: '#facc15', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%', shadowColor: '#facc15', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    actionButtonDisabled: { opacity: 0.7 },
    actionButtonText: { color: '#111827', fontSize: 16, fontWeight: 'bold' },
    secondaryButton: { borderWidth: 1, borderColor: '#3b82f6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    secondaryButtonText: { color: '#60a5fa', fontSize: 16, fontWeight: 'bold' }
});
