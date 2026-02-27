import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../services/authService';

export default function RiderPersonalInfoScreen() {
    const { userId } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        if (!userId) return;
        try {
            const data = await getUserProfile(userId);
            if (data) {
                setProfile(data);
                setName(data.name || '');
                setPhone(data.phone || '');
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userId) return;
        if (!name.trim()) {
            Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อของคุณ');
            return;
        }

        setSaving(true);
        try {
            await updateUserProfile(userId, { name, phone });
            Alert.alert('สำเร็จ', 'บันทึกข้อมูลส่วนบุคคลเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => router.push('/(rider)/profile' as any) }
            ]);
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setSaving(false);
        }
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
                <Text style={styles.headerTitle}>ข้อมูลส่วนบุคคล</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>ข้อมูลพื้นฐาน</Text>
                </View>
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อ - นามสกุล</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="ระบุเบอร์โทรศัพท์ (ถ้ามี)"
                            placeholderTextColor="#6b7280"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>อีเมล (ไม่สามารถแก้ไขได้)</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={profile?.email || ''}
                            editable={false}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
                    )}
                </TouchableOpacity>
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
    content: { padding: 20, paddingBottom: 40 },
    sectionHeader: { marginBottom: 12, marginLeft: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#9ca3af' },
    formSection: { backgroundColor: '#1f2937', borderRadius: 16, padding: 20, marginBottom: 20 },
    inputGroup: { marginBottom: 16 },
    label: { color: '#9ca3af', fontSize: 14, fontWeight: '500', marginBottom: 8 },
    input: { backgroundColor: '#111827', borderRadius: 12, padding: 16, color: '#f9fafb', fontSize: 16, borderWidth: 1, borderColor: '#374151' },
    inputDisabled: { backgroundColor: '#11182780', color: '#6b7280', borderColor: '#1f2937' },
    saveButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
