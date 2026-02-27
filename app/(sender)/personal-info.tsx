import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../services/authService';

export default function PersonalInfoScreen() {
    const { userId } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

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
                setName(data.name || '');
                setPhone(data.phone || '');
                setEmail(data.email || '');
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
                { text: 'ตกลง', onPress: () => router.push('/(sender)/profile' as any) }
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
                <ActivityIndicator size="large" color="#fbbf24" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(sender)/profile' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#f8fafc" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ข้อมูลส่วนบุคคล</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อ - นามสกุล</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="ระบุชื่อของคุณ"
                            placeholderTextColor="#64748b"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="ระบุเบอร์โทรศัพท์ (ถ้ามี)"
                            placeholderTextColor="#64748b"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>อีเมล (ไม่สามารถแก้ไขได้)</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={email}
                            editable={false}
                        />
                        <Text style={styles.helperText}>หากต้องการเปลี่ยนอีเมล กรุณาไปที่เมนู ความปลอดภัย</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#0f172a" />
                        ) : (
                            <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
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
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#1e293b',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    content: {
        padding: 20,
    },
    formSection: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#0f172a',
        borderRadius: 12,
        padding: 16,
        color: '#f8fafc',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    inputDisabled: {
        backgroundColor: '#0f172a80',
        color: '#64748b',
        borderColor: '#1e293b',
    },
    helperText: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 6,
    },
    saveButton: {
        backgroundColor: '#fbbf24',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
