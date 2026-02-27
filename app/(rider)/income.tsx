import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getRiderOrders } from '../../services/orderService';


export default function RiderIncomeScreen() {
    const { userId } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [totalIncome, setTotalIncome] = useState(0);
    const [commission, setCommission] = useState(0);
    const [netIncome, setNetIncome] = useState(0);
    const [creditBalance, setCreditBalance] = useState(1500); // Mock starting credit

    useEffect(() => {
        loadIncomeData();
    }, [userId]);

    const loadIncomeData = async () => {
        if (!userId) return;
        try {
            const orders = await getRiderOrders(userId);
            // Filter only completed orders by this rider
            const myOrders = orders.filter(o => o.status === 'completed');

            // Calculate total based on real order data
            let gross = 0;
            myOrders.forEach(order => {
                gross += order.price || 0;
            });

            const comRate = 0.15; // 15% commission
            const deducted = gross * comRate;

            setTotalIncome(gross);
            setCommission(deducted);
            setNetIncome(gross - deducted);

            // Mock credit update based on commission paid
            setCreditBalance(1500 - deducted);

        } catch (error) {
            console.error("Error loading income:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    // Progress Bar calculations
    const commPercentage = totalIncome > 0 ? (commission / totalIncome) * 100 : 0;
    const incomePercentage = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

    // Colors
    const colorIncome = '#10b981'; // Emerald Green
    const colorCommission = '#ef4444'; // Red

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(rider)/profile' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#f9fafb" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>รายได้และกระเป๋าเงิน</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Credit Wallet Card */}
                <View style={styles.walletCard}>
                    <View style={styles.walletHeader}>
                        <View style={styles.walletIconContainer}>
                            <Ionicons name="wallet" size={24} color="#facc15" />
                        </View>
                        <Text style={styles.walletTitle}>กระเป๋าเงินเครดิต</Text>
                    </View>
                    <Text style={styles.walletBalance}>฿ {creditBalance.toFixed(2)}</Text>
                    <Text style={styles.walletSubtitle}>ยอดเครดิตคงเหลือสำหรับรับงาน</Text>

                    <TouchableOpacity style={styles.topupButton}>
                        <Text style={styles.topupButtonText}>เติมเครดิต</Text>
                    </TouchableOpacity>
                </View>

                {/* Income Summary Heading */}
                <Text style={styles.sectionHeader}>สรุปรายได้ทั้งหมด</Text>

                <View style={styles.chartCard}>
                    {/* Progress Bar Chart */}
                    <View style={styles.barChartContainer}>
                        <View style={styles.netIncomeHighlight}>
                            <Text style={styles.netIncomeHighlightDesc}>รายได้สุทธิ</Text>
                            <Text style={styles.netIncomeHighlightAmount}>฿{netIncome.toFixed(0)}</Text>
                        </View>

                        <View style={styles.progressBarWrapper}>
                            {totalIncome > 0 ? (
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressIncome, { width: `${incomePercentage}%`, backgroundColor: colorIncome }]} />
                                    <View style={[styles.progressComm, { width: `${commPercentage}%`, backgroundColor: colorCommission }]} />
                                </View>
                            ) : (
                                <View style={[styles.progressBar, { backgroundColor: '#374151' }]} />
                            )}
                        </View>
                        <View style={styles.progressLabels}>
                            <Text style={[styles.progressLabel, { color: colorIncome }]}>{incomePercentage.toFixed(0)}%</Text>
                            <Text style={[styles.progressLabel, { color: colorCommission }]}>{commPercentage.toFixed(0)}%</Text>
                        </View>
                    </View>

                    {/* Chart Legends */}
                    <View style={styles.legendsContainer}>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: colorIncome }]} />
                            <Text style={styles.legendText}>รายได้สุทธิ ({totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(0) : 0}%)</Text>
                            <Text style={[styles.legendAmount, { color: colorIncome }]}>฿ {netIncome.toFixed(2)}</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: colorCommission }]} />
                            <Text style={styles.legendText}>หักค่าคอมฯ ({totalIncome > 0 ? ((commission / totalIncome) * 100).toFixed(0) : 0}%)</Text>
                            <Text style={[styles.legendAmount, { color: colorCommission }]}>฿ {commission.toFixed(2)}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.legendRow}>
                            <Text style={styles.totalText}>ยอดรวมทั้งหมด (Gross)</Text>
                            <Text style={styles.totalAmount}>฿ {totalIncome.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Information Callout */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={24} color="#60a5fa" />
                    <Text style={styles.infoText}>
                        ระบบจะหักค่าบริการ 15% จากเครดิตของคุณอัตโนมัติเมื่อส่งงานสำเร็จ กรุณารักษาเครดิตให้เพียงพอเสมอ
                    </Text>
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
    content: { padding: 20, paddingBottom: 40 },

    walletCard: { backgroundColor: 'rgba(250, 204, 21, 0.1)', borderRadius: 16, padding: 24, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(250, 204, 21, 0.3)' },
    walletHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    walletIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(250, 204, 21, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    walletTitle: { fontSize: 16, color: '#facc15', fontWeight: '600' },
    walletBalance: { fontSize: 36, fontWeight: 'bold', color: '#f9fafb', marginBottom: 4 },
    walletSubtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 20 },
    topupButton: { backgroundColor: '#facc15', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    topupButtonText: { color: '#111827', fontSize: 16, fontWeight: 'bold' },

    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#f9fafb', marginBottom: 16, paddingHorizontal: 4 },

    chartCard: { backgroundColor: '#1f2937', borderRadius: 16, paddingVertical: 24, marginBottom: 20 },
    barChartContainer: { paddingHorizontal: 24, marginBottom: 20 },
    netIncomeHighlight: { alignItems: 'center', marginBottom: 20 },
    netIncomeHighlightDesc: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },
    netIncomeHighlightAmount: { fontSize: 32, fontWeight: 'bold', color: '#f9fafb' },
    progressBarWrapper: { height: 16, width: '100%', borderRadius: 8, overflow: 'hidden', backgroundColor: '#374151', marginBottom: 8 },
    progressBar: { flexDirection: 'row', height: '100%', width: '100%' },
    progressIncome: { height: '100%', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
    progressComm: { height: '100%', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { fontSize: 13, fontWeight: '600' },

    legendsContainer: { paddingHorizontal: 24, marginTop: 10 },
    legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    legendText: { flex: 1, fontSize: 15, color: '#d1d5db' },
    legendAmount: { fontSize: 16, fontWeight: 'bold' },

    divider: { height: 1, backgroundColor: '#374151', marginVertical: 12 },
    totalText: { flex: 1, fontSize: 16, color: '#f9fafb', fontWeight: 'bold' },
    totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#f9fafb' },

    infoBox: { flexDirection: 'row', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', alignItems: 'center' },
    infoText: { color: '#93c5fd', fontSize: 13, flex: 1, marginLeft: 12, lineHeight: 20 }
});
