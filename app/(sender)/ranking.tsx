import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../services/authService';

const TIERS = [
    { name: 'Bronze', min: 0, color: '#cd7f32', icon: 'medal', benefits: ['ส่วนลดค่าส่ง 5% เดือนละ 1 ครั้ง'] },
    { name: 'Silver', min: 100, color: '#c0c0c0', icon: 'medal', benefits: ['ส่วนลดค่าส่ง 5% เดือนละ 3 ครั้ง', 'รับแต้ม x1.2'] },
    { name: 'Gold', min: 500, color: '#ffd700', icon: 'crown', benefits: ['ส่วนลดค่าส่ง 10% เดือนละ 3 ครั้ง', 'รับแต้ม x1.5', 'สิทธิเรียกคนขับด่วนฟรี 1 ครั้ง'] },
    { name: 'Platinum', min: 1000, color: '#e5e4e2', icon: 'gem', benefits: ['ส่วนลดค่าส่ง 10% ไม่จำกัดจำนวนครั้ง', 'รับแต้ม x2', 'คิวคนขับ priority'] },
    { name: 'Diamond', min: 5000, color: '#b9f2ff', icon: 'gem', benefits: ['ส่งฟรีเดือนละ 2 ครั้ง', 'รับแต้ม x3', 'ผู้ดูแลส่วนตัว', 'ของสัมมนาคุณพรีเมียมรายปี'] },
];

export default function RankingScreen() {
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
            <View style={styles.center}>
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
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(sender)/profile' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#f8fafc" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>แรงกิ้งและสิทธิพิเศษ</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.mainBadgeContainer}>
                    <View style={[styles.badgeCircle, { borderColor: currentTier.color }]}>
                        <FontAwesome5 name={currentTier.icon} size={50} color={currentTier.color} />
                    </View>
                    <Text style={[styles.tierName, { color: currentTier.color }]}>{currentTier.name} Member</Text>
                    <Text style={styles.pointsText}>{points} คะแนนสะสม</Text>
                </View>

                {nextTier && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: currentTier.color }]} />
                        </View>
                        <Text style={styles.progressText}>{progressStr}</Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>สิทธิพิเศษของคุณ ({currentTier.name})</Text>
                <View style={styles.benefitsCard}>
                    {currentTier.benefits.map((benefit, idx) => (
                        <View key={idx} style={styles.benefitRow}>
                            <Ionicons name="checkmark-circle" size={20} color={currentTier.color} />
                            <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>ระดับสมาชิกทั้งหมด</Text>
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
        paddingBottom: 50,
    },
    mainBadgeContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    badgeCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    tierName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    pointsText: {
        fontSize: 16,
        color: '#94a3b8',
    },
    progressContainer: {
        marginBottom: 30,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#334155',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 13,
        color: '#94a3b8',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 15,
    },
    benefitsCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    benefitText: {
        color: '#e2e8f0',
        fontSize: 15,
        marginLeft: 12,
        flex: 1,
    },
    tierRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    tierRowActive: {
        borderColor: '#3b82f6',
        borderWidth: 1,
        backgroundColor: '#1e293b80',
    },
    tierInfo: {
        marginLeft: 15,
        flex: 1,
    },
    tierRowName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tierRequirement: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    currentBadge: {
        backgroundColor: '#3b82f6',
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
    }
});
