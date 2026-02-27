import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../services/authService';

const TIERS = [
    { name: 'Bronze', min: 0, color: '#cd7f32', icon: 'medal', benefits: ['ส่วนลดค่าน้ำมัน 1%'] },
    { name: 'Silver', min: 100, color: '#c0c0c0', icon: 'medal', benefits: ['ส่วนลดค่าน้ำมัน 3%', 'เสื้อแจ็คเก็ต ThunderGo ฟรี 1 ตัว'] },
    { name: 'Gold', min: 500, color: '#ffd700', icon: 'crown', benefits: ['ส่วนลดค่าน้ำมัน 5%', 'รับงานล่วงหน้าได้พิเศษ', 'กล่องใส่อาหารพรีเมียม'] },
    { name: 'Platinum', min: 1000, color: '#e5e4e2', icon: 'gem', benefits: ['ส่วนลดค่าน้ำมัน 8%', 'คิวงาน VIP', 'โบนัสพิเศษรายเดือน'] },
];

export default function RiderRanking() {
    const { userId } = useAuth();
    const router = useRouter();
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [userId])
    );

    const loadProfile = async () => {
        if (!userId) return;
        try {
            const data = await getUserProfile(userId);
            setPoints(data?.points || 0);
        } catch (error) {
            console.error("Error loading points:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentTier = () => {
        for (let i = TIERS.length - 1; i >= 0; i--) {
            if (points >= TIERS[i].min) return TIERS[i];
        }
        return TIERS[0];
    };

    const getNextTier = () => {
        for (let i = 0; i < TIERS.length; i++) {
            if (points < TIERS[i].min) return TIERS[i];
        }
        return null;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
                <ActivityIndicator size="large" color="#fbbf24" />
            </View>
        );
    }

    const currentTier = getCurrentTier();
    const nextTier = getNextTier();

    // Calculate progress to next tier
    let progressStr = 'Max Level';
    let progressPct = 100;

    if (nextTier) {
        const pointsNeeded = nextTier.min - points;
        progressStr = `ขาดอีก ${pointsNeeded} คะแนน เพื่ออัปเกรดเป็น ${nextTier.name}`;

        const tierRange = nextTier.min - currentTier.min;
        const currentProgress = points - currentTier.min;
        progressPct = Math.min(100, Math.max(0, (currentProgress / tierRange) * 100));
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#f9fafb" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>แรงกิ้งของฉัน (Rider)</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.currentRankCard}>
                    <View style={[styles.rankIconContainer, { borderColor: currentTier.color }]}>
                        <FontAwesome5 name={currentTier.icon} size={48} color={currentTier.color} />
                    </View>
                    <Text style={[styles.rankName, { color: currentTier.color }]}>{currentTier.name} Rider</Text>
                    <Text style={styles.pointsText}>{points} คะแนนสะสม</Text>

                    {nextTier && (
                        <>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, { width: `${progressPct}%`, backgroundColor: currentTier.color }]} />
                            </View>
                            <Text style={styles.progressText}>{progressStr}</Text>
                        </>
                    )}
                </View>

                <Text style={styles.sectionTitle}>สิทธิพิเศษสำหรับคุณ ({currentTier.name})</Text>
                <View style={styles.privilegeCard}>
                    {currentTier.benefits.map((benefit, idx) => (
                        <View key={idx} style={styles.privilegeItem}>
                            <View style={[styles.pIconBg, { backgroundColor: `${currentTier.color}20` }]}>
                                <Ionicons name="checkmark-circle" size={24} color={currentTier.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.pTitle}>{benefit}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>ระดับสมาชิกทั้งหมด</Text>
                {TIERS.map((tier, idx) => {
                    const isCurrent = tier.name === currentTier.name;
                    return (
                        <View key={idx} style={[styles.tierRow, isCurrent && styles.tierRowActive]}>
                            <FontAwesome5 name={tier.icon} size={24} color={tier.color} style={{ width: 30, textAlign: 'center' }} />
                            <View style={styles.tierInfo}>
                                <Text style={[styles.tierRowName, { color: tier.color }]}>{tier.name}</Text>
                                <Text style={styles.tierRequirement}>{tier.min} ขึ้นไป</Text>
                            </View>
                            {isCurrent && <Text style={styles.currentBadge}>ปัจจุบัน</Text>}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#1f2937' },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#374151', borderRadius: 20 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#f9fafb' },
    content: { padding: 20 },
    currentRankCard: { alignItems: 'center', backgroundColor: '#1f2937', padding: 30, borderRadius: 24, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5, borderWidth: 1, borderColor: '#374151' },
    rankIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 4, borderColor: '#c0c0c0' },
    rankName: { fontSize: 28, fontWeight: '800', color: '#f9fafb', marginBottom: 8 },
    pointsText: { fontSize: 16, color: '#9ca3af', marginBottom: 24 },
    progressBarContainer: { width: '100%', height: 10, backgroundColor: '#374151', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
    progressBar: { height: '100%', backgroundColor: '#c0c0c0', borderRadius: 5 },
    progressText: { fontSize: 13, color: '#9ca3af' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f9fafb', marginBottom: 16, marginLeft: 4 },
    privilegeCard: { backgroundColor: '#1f2937', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#374151' },
    privilegeItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    pIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    pTitle: { fontSize: 16, fontWeight: '600', color: '#f9fafb', marginBottom: 4 },
    pDesc: { fontSize: 13, color: '#9ca3af' },
    tierRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#374151' },
    tierRowActive: { borderColor: '#10b981', backgroundColor: '#1f2937' },
    tierInfo: { marginLeft: 15, flex: 1 },
    tierRowName: { fontSize: 16, fontWeight: 'bold' },
    tierRequirement: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
    currentBadge: { backgroundColor: '#10b981', color: '#fff', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' }
});
