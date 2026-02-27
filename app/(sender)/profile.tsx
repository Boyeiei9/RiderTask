import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../services/authService';
import { uploadImageAsync } from '../../services/storageService';

export default function SenderProfile() {
    const { userId, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [language, setLanguage] = useState('ภาษาไทย');
    const INITIAL_BALANCE = 540.50; // Mock balance

    useFocusEffect(
        useCallback(() => {
            loadProfile();
            loadLanguage();
        }, [userId])
    );

    const loadLanguage = async () => {
        try {
            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang) {
                const langMap: any = { th: 'ภาษาไทย', en: 'English', zh: 'Chinese', ja: 'Japanese' };
                setLanguage(langMap[savedLang] || 'ภาษาไทย');
            }
        } catch (e) { }
    };

    const loadProfile = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await getUserProfile(userId);
            setProfile(data);
        } catch (error) {
            console.error("Error loading profile:", error);
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        if (!userId) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newUri = result.assets[0].uri;
            const base64 = result.assets[0].base64;
            setProfile({ ...profile, avatarUrl: newUri }); // optimistic update
            try {
                const storagePath = `avatars/${userId}_${Date.now()}.jpg`;
                const uploadData = base64 ? `data:image/jpeg;base64,${base64}` : newUri;
                const downloadUrl = await uploadImageAsync(uploadData, storagePath);
                await updateUserProfile(userId, { avatarUrl: downloadUrl });
                setProfile((prev: any) => ({ ...prev, avatarUrl: downloadUrl }));
            } catch (error) {
                console.error("Error saving avatar:", error);
                Alert.alert('แก้ไขรูปโปรไฟล์ล้มเหลว', 'โปรดลองอีกครั้ง');
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fbbf24" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>ไม่พบข้อมูลโปรไฟล์</Text>
            </View>
        );
    }

    const getRankInfo = (points: number) => {
        if (!points || points < 100) return { name: 'Bronze', color: '#cd7f32', icon: 'medal' };
        if (points < 500) return { name: 'Silver', color: '#c0c0c0', icon: 'medal' };
        if (points < 1000) return { name: 'Gold', color: '#ffd700', icon: 'crown' };
        if (points < 5000) return { name: 'Platinum', color: '#e5e4e2', icon: 'gem' };
        return { name: 'Diamond', color: '#b9f2ff', icon: 'gem' };
    };

    const userRank = getRankInfo(profile.points || 0);

    const MenuRow = ({ icon, title, subtitle, onPress, iconLib = "FontAwesome5", color = "#64748b" }: any) => (
        <TouchableOpacity style={styles.menuRow} onPress={onPress}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
                {iconLib === "FontAwesome5" && <FontAwesome5 name={icon} size={20} color={color} />}
                {iconLib === "Ionicons" && <Ionicons name={icon} size={24} color={color} />}
                {iconLib === "MaterialIcons" && <MaterialIcons name={icon} size={24} color={color} />}
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header Profile Summary */}
            <View style={styles.header}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {profile.avatarUrl ? (
                        <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{profile.name?.substring(0, 1) || 'U'}</Text>
                    )}
                    <View style={styles.editIconBadge}>
                        <FontAwesome5 name="camera" size={12} color="#f8fafc" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.email}>{profile.email}</Text>

                {/* Ranking Badge overview */}
                <TouchableOpacity
                    style={[styles.rankBadge, { borderColor: userRank.color }]}
                    onPress={() => router.push('/(sender)/ranking' as any)}
                >
                    <FontAwesome5 name={userRank.icon} size={14} color={userRank.color} style={{ marginRight: 6 }} />
                    <Text style={[styles.rankText, { color: userRank.color }]}>{userRank.name} Member</Text>
                </TouchableOpacity>
            </View>

            {/* Menu List */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>บัญชีและการตั้งค่า</Text>

                <MenuRow
                    icon="crown"
                    title="แรงกิ้งและสิทธิพิเศษ"
                    subtitle={`${profile.points || 0} คะแนน`}
                    color="#fbbf24"
                    onPress={() => router.push('/(sender)/ranking' as any)}
                />
                <MenuRow
                    icon="wallet"
                    title="กระเป๋าเงิน (Wallet)"
                    subtitle={`฿ ${INITIAL_BALANCE.toFixed(2) || '0.00'}`}
                    color="#10b981"
                    onPress={() => router.push('/(sender)/wallet' as any)}
                />
                <MenuRow
                    icon="user-edit"
                    title="ข้อมูลส่วนบุคคล"
                    subtitle="ชื่อ, อีเมล, เบอร์โทรศัพท์"
                    color="#3b82f6"
                    onPress={() => router.push('/(sender)/personal-info' as any)}
                />
                <MenuRow
                    icon="shield-alt"
                    title="ความปลอดภัย"
                    subtitle="รีเซ็ตรหัสผ่าน, เปลี่ยนอีเมล"
                    color="#10b981"
                    onPress={() => router.push('/(sender)/security' as any)}
                />
                <MenuRow
                    icon="language"
                    iconLib="MaterialIcons"
                    title="ภาษา (Language)"
                    subtitle={language}
                    color="#8b5cf6"
                    onPress={() => router.push('/(sender)/language' as any)}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>อื่นๆ</Text>
                <MenuRow
                    icon="headset"
                    title="ติดต่อการสนับสนุน"
                    color="#f97316"
                    onPress={() => Alert.alert('ติดต่อเรา', 'โทร: 02-123-4567\nอีเมล: support@thundergo.com')}
                />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <FontAwesome5 name="sign-out-alt" size={20} color="#ef4444" style={{ marginRight: 10 }} />
                <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>ThunderGo Version 1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#1e293b',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fbbf24',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 4,
        borderColor: '#0f172a',
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3b82f6',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0f172a',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 15,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 10,
        marginLeft: 4,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f8fafc',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ef444430',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
        marginTop: 30,
    }
});
