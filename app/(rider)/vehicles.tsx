import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../services/authService';

export default function RiderVehiclesScreen() {
    const { userId } = useAuth();
    const router = useRouter();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ type: '', plate: '', year: '' });
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const vehicleTypes = ['รถมอเตอร์ไซค์', 'รถยนต์', 'รถกระบะ'];

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        if (!userId) return;
        try {
            const data = await getUserProfile(userId);
            if (data) {
                // fallback to old riderProfile if vehicles array doesn't exist (migration)
                if (data.vehicles && data.vehicles.length > 0) {
                    setVehicles(data.vehicles);
                    setActiveIndex(data.activeVehicleIndex || 0);
                } else if (data.riderProfile) {
                    const migratedVehicles = [{ ...data.riderProfile, id: Date.now().toString() }];
                    setVehicles(migratedVehicles);
                    setActiveIndex(0);
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลยานพาหนะได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            const updateData: any = {
                vehicles,
                activeVehicleIndex: activeIndex
            };

            // Sync active vehicle to riderProfile for backward compatibility with old code
            if (vehicles.length > 0) {
                updateData.riderProfile = vehicles[activeIndex];
            }

            await updateUserProfile(userId, updateData);
            Alert.alert('สำเร็จ', 'บันทึกข้อมูลยานพาหนะเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => router.push('/(rider)/profile' as any) }
            ]);
        } catch (error) {
            console.error("Error saving vehicles:", error);
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setSaving(false);
        }
    };

    const handleAddVehicle = () => {
        if (!newVehicle.type || !newVehicle.plate || !newVehicle.year) {
            Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลรถให้ครบถ้วน');
            return;
        }

        setVehicles([...vehicles, { vehicleType: newVehicle.type, plate: newVehicle.plate, vehicleYear: newVehicle.year, id: Date.now().toString() }]);
        setNewVehicle({ type: '', plate: '', year: '' });
        setShowVehicleModal(false);
    };

    const handleDeleteVehicle = (index: number) => {
        if (vehicles.length === 1) {
            Alert.alert('ไม่สามารถลบได้', 'คุณต้องมียานพาหนะอย่างน้อย 1 คันในระบบ');
            return;
        }

        Alert.alert(
            'ยืนยันการลบ',
            'คุณต้องการลบยานพาหนะคันนี้ใช่หรือไม่?',
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ลบ',
                    style: 'destructive',
                    onPress: () => {
                        const newVehicles = vehicles.filter((_, i) => i !== index);
                        setVehicles(newVehicles);
                        if (activeIndex === index) {
                            setActiveIndex(0);
                        } else if (activeIndex > index) {
                            setActiveIndex(activeIndex - 1);
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
                <Text style={styles.headerTitle}>จัดการยานพาหนะ</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.helperSection}>
                    <Ionicons name="information-circle-outline" size={24} color="#60a5fa" />
                    <Text style={styles.helperText}>
                        เลือกยานพาหนะปัจจุบันที่คุณใช้สำหรับรับงาน แตะที่รายการเพื่อเลือกเป็นคันที่ใช้งานปัจจุบัน
                    </Text>
                </View>

                <View style={styles.formSection}>
                    {vehicles.map((v, index) => (
                        <TouchableOpacity
                            key={v.id || index.toString()}
                            style={[styles.vehicleCard, activeIndex === index && styles.vehicleCardActive]}
                            onPress={() => setActiveIndex(index)}
                        >
                            <View style={styles.vehicleIconBadge}>
                                <MaterialCommunityIcons
                                    name={v.vehicleType?.includes('มอเตอร์ไซค์') ? 'motorbike' : 'car'}
                                    size={24}
                                    color={activeIndex === index ? '#10b981' : '#9ca3af'}
                                />
                            </View>
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehiclePlate}>{v.plate}</Text>
                                <Text style={styles.vehicleDesc}>{v.vehicleType} • ปี {v.vehicleYear}</Text>
                            </View>

                            <View style={styles.vehicleActions}>
                                {activeIndex === index && (
                                    <View style={styles.activeBadge}>
                                        <Text style={styles.activeText}>ใช้งานอยู่</Text>
                                    </View>
                                )}
                                <TouchableOpacity onPress={() => handleDeleteVehicle(index)} style={styles.deleteButton}>
                                    <Ionicons name="trash-outline" size={20} color="#f87171" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.addVehicleButton} onPress={() => setShowVehicleModal(true)}>
                        <Ionicons name="add-circle-outline" size={20} color="#10b981" />
                        <Text style={styles.addVehicleText}>เพิ่มยานพาหนะใหม่</Text>
                    </TouchableOpacity>
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

            <Modal visible={showVehicleModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>ขึ้นทะเบียนรถใหม่</Text>

                        <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                            <Text style={styles.label}>ประเภทรถ</Text>
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center' }]}
                                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                            >
                                <Text style={{ color: newVehicle.type ? '#f9fafb' : '#6b7280', fontSize: 16 }}>
                                    {newVehicle.type || 'เลือกประเภทรถ'}
                                </Text>
                            </TouchableOpacity>
                            {showTypeDropdown && (
                                <View style={styles.dropdown}>
                                    {vehicleTypes.map((vType) => (
                                        <TouchableOpacity
                                            key={vType}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setNewVehicle({ ...newVehicle, type: vType });
                                                setShowTypeDropdown(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>{vType}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ทะเบียนรถ</Text>
                            <TextInput
                                style={styles.input}
                                value={newVehicle.plate}
                                onChangeText={(t) => setNewVehicle({ ...newVehicle, plate: t })}
                                placeholder="1กข 1234 กทม."
                                placeholderTextColor="#6b7280"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ปีที่จดทะเบียน</Text>
                            <TextInput
                                style={styles.input}
                                value={newVehicle.year}
                                onChangeText={(t) => setNewVehicle({ ...newVehicle, year: t })}
                                placeholder="2023"
                                keyboardType="numeric"
                                placeholderTextColor="#6b7280"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowVehicleModal(false)}>
                                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={handleAddVehicle}>
                                <Text style={styles.confirmButtonText}>เพิ่มรถ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    helperSection: { flexDirection: 'row', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', alignItems: 'center' },
    helperText: { color: '#93c5fd', fontSize: 13, flex: 1, marginLeft: 12, lineHeight: 20 },
    formSection: { backgroundColor: '#1f2937', borderRadius: 16, padding: 20, marginBottom: 20 },
    saveButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

    // Vehicle styles
    vehicleCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#111827', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
    vehicleCardActive: { borderColor: '#10b981', backgroundColor: '#10b98115' },
    vehicleIconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1f2937', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    vehicleInfo: { flex: 1 },
    vehiclePlate: { fontSize: 16, fontWeight: '600', color: '#f9fafb', marginBottom: 4 },
    vehicleDesc: { fontSize: 13, color: '#9ca3af' },
    vehicleActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 44 },
    activeBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
    activeText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
    deleteButton: { padding: 4 },
    addVehicleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#374151', borderRadius: 12, marginTop: 4 },
    addVehicleText: { color: '#10b981', fontSize: 15, fontWeight: '600', marginLeft: 8 },

    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#1f2937', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#f9fafb', marginBottom: 20, textAlign: 'center' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
    cancelButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#374151', alignItems: 'center' },
    cancelButtonText: { color: '#f9fafb', fontSize: 16, fontWeight: '600' },
    confirmButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center' },
    confirmButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

    // Form inside modal
    inputGroup: { marginBottom: 16 },
    label: { color: '#9ca3af', fontSize: 14, fontWeight: '500', marginBottom: 8 },
    input: { backgroundColor: '#111827', borderRadius: 12, padding: 16, color: '#f9fafb', fontSize: 16, borderWidth: 1, borderColor: '#374151' },
    dropdown: { backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#374151', paddingVertical: 4, marginTop: 4, position: 'absolute', top: 75, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
    dropdownItemText: { color: '#f9fafb', fontSize: 16 }
});
