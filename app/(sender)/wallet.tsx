import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const INITIAL_BALANCE = 540.50;

const mockTransactions = [
    { id: '1', type: 'topup', amount: 1000, date: '25 ก.พ. 2024, 14:30', title: 'เติมเงินผ่านธนาคาร', status: 'success' },
    { id: '2', type: 'payment', amount: -150, date: '24 ก.พ. 2024, 10:15', title: 'ชำระค่าส่งพัสดุ (Order #1024)', status: 'success' },
    { id: '3', type: 'payment', amount: -309.50, date: '20 ก.พ. 2024, 16:45', title: 'ชำระค่าส่งพัสดุ (Order #1023)', status: 'success' },
];

export default function SenderWallet() {
    const router = useRouter();
    const [balance] = useState(INITIAL_BALANCE);

    const renderTransaction = ({ item }: { item: any }) => (
        <View style={styles.transactionItem}>
            <View style={[styles.txIconContainer, item.type === 'topup' ? styles.txIconTopup : styles.txIconPayment]}>
                <FontAwesome5
                    name={item.type === 'topup' ? 'arrow-down' : 'shopping-bag'}
                    size={16}
                    color={item.type === 'topup' ? '#10b981' : '#f59e0b'}
                />
            </View>
            <View style={styles.txDetails}>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txDate}>{item.date}</Text>
            </View>
            <View style={styles.txAmountContainer}>
                <Text style={[styles.txAmount, item.amount > 0 ? styles.txAmountPositive : styles.txAmountNegative]}>
                    {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)} ฿
                </Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header / Balance Card */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                    <FontAwesome5 name="arrow-left" size={20} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>กระเป๋าเงิน ThunderGo</Text>

                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>ยอดเงินคงเหลือ</Text>
                        <MaterialCommunityIcons name="wallet-outline" size={24} color="#f8fafc" />
                    </View>
                    <Text style={styles.balanceAmount}>฿ {balance.toFixed(2)}</Text>

                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionIcon}>
                                <FontAwesome5 name="plus" size={16} color="#fbbf24" />
                            </View>
                            <Text style={styles.actionText}>เติมเงิน</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionIcon}>
                                <FontAwesome5 name="exchange-alt" size={16} color="#fbbf24" />
                            </View>
                            <Text style={styles.actionText}>โอนเงิน</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionIcon}>
                                <FontAwesome5 name="history" size={16} color="#fbbf24" />
                            </View>
                            <Text style={styles.actionText}>ประวัติ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Payment Methods */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ช่องทางการชำระเงินที่บันทึกไว้</Text>

                <TouchableOpacity style={styles.paymentMethodCard}>
                    <View style={styles.methodIconContainer}>
                        <FontAwesome5 name="credit-card" size={20} color="#3b82f6" />
                    </View>
                    <View style={styles.methodDetails}>
                        <Text style={styles.methodName}>Kasikorn Bank (KBank)</Text>
                        <Text style={styles.methodDesc}>**** **** **** 4592</Text>
                    </View>
                    <FontAwesome5 name="check-circle" size={20} color="#10b981" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.addMethodButton}>
                    <FontAwesome5 name="plus-circle" size={16} color="#3b82f6" style={{ marginRight: 8 }} />
                    <Text style={styles.addMethodText}>เพิ่มช่องทางการชำระเงิน</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>รายการล่าสุด</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.transactionsContainer}>
                    <FlatList
                        data={mockTransactions}
                        keyExtractor={item => item.id}
                        renderItem={renderTransaction}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 24, paddingTop: 40, backgroundColor: '#fff', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
    balanceCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, shadowColor: '#fbbf24', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    balanceLabel: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
    balanceAmount: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 24 },
    cardActions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 },
    actionButton: { alignItems: 'center', flex: 1 },
    actionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(251, 191, 36, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    actionText: { color: '#f8fafc', fontSize: 13, fontWeight: '500' },

    section: { padding: 24, paddingTop: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
    seeAllText: { fontSize: 14, color: '#3b82f6', fontWeight: '600', marginBottom: 16 },

    paymentMethodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    methodIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    methodDetails: { flex: 1 },
    methodName: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    methodDesc: { fontSize: 13, color: '#64748b' },
    addMethodButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', padding: 16, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#bfdbfe' },
    addMethodText: { fontSize: 15, fontWeight: '600', color: '#3b82f6' },

    transactionsContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    transactionItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    txIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    txIconTopup: { backgroundColor: '#d1fae5' },
    txIconPayment: { backgroundColor: '#fef3c7' },
    txDetails: { flex: 1 },
    txTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    txDate: { fontSize: 12, color: '#64748b' },
    txAmountContainer: { alignItems: 'flex-end' },
    txAmount: { fontSize: 15, fontWeight: '700' },
    txAmountPositive: { color: '#10b981' },
    txAmountNegative: { color: '#1e293b' },
    separator: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 12 }
});
