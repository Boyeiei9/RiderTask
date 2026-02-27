import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGES = [
    { code: 'th', name: 'ภาษาไทย', nativeName: 'ภาษาไทย' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

export default function LanguageScreen() {
    const router = useRouter();
    const [selectedLang, setSelectedLang] = useState('th');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang) {
                setSelectedLang(savedLang);
            }
        } catch (error) {
            console.error('Error loading language', error);
        }
    };

    const handleSelectLanguage = async (code: string) => {
        setSelectedLang(code);
        try {
            await AsyncStorage.setItem('appLanguage', code);
            // In a real app, you would reload or trigger an i18n context update here
        } catch (error) {
            console.error('Error saving language', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(sender)/profile' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#f8fafc" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ภาษา (Language)</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.infoText}>
                    เลือกภาษาที่ต้องการให้แอปพลิเคชันแสดงผล (บางส่วนอาจยังไม่รองรับการแปลภาษาทั้งหมดในรุ่นทดสอบ)
                </Text>

                <View style={styles.listContainer}>
                    {LANGUAGES.map((lang, index) => {
                        const isSelected = selectedLang === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageRow,
                                    index === LANGUAGES.length - 1 && { borderBottomWidth: 0 }
                                ]}
                                onPress={() => handleSelectLanguage(lang.code)}
                            >
                                <View style={styles.languageInfo}>
                                    <Text style={[styles.nativeName, isSelected && styles.selectedText]}>{lang.nativeName}</Text>
                                    <Text style={styles.englishName}>{lang.name}</Text>
                                </View>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    infoText: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
    },
    listContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        overflow: 'hidden',
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    languageInfo: {
        flex: 1,
    },
    nativeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f8fafc',
        marginBottom: 2,
    },
    selectedText: {
        color: '#10b981', // Green if selected
    },
    englishName: {
        fontSize: 13,
        color: '#64748b',
    }
});
