import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function WelcomeScreen() {
    const router = useRouter();
    const { role, loading } = useAuth();

    useEffect(() => {
        if (!loading && role) {
            if (role === 'sender') {
                router.replace('/(sender)');
            } else if (role === 'rider') {
                router.replace('/(rider)');
            }
        }
    }, [role, loading]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading ThunderGo...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome5 name="bolt" size={42} color="#fbbf24" style={{ marginRight: 12 }} />
                    <Text style={styles.title}>Thunder<Text style={styles.titleHighlight}>Go</Text></Text>
                </View>
                <Text style={styles.subtitle}>แอปพลิเคชันรับส่งของที่คุณวางใจได้</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.buttonPrimaryText}>เข้าสู่ระบบ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.buttonSecondaryText}>สมัครสมาชิกใหม่</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Deep dark background
        justifyContent: 'space-between',
        padding: 30,
    },
    header: {
        marginTop: 100,
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: '#f8fafc', // Light text
    },
    titleHighlight: {
        color: '#fbbf24', // ThunderGo Yellow
    },
    subtitle: {
        marginTop: 10,
        fontSize: 16,
        color: '#94a3b8', // Muted text
        textAlign: 'center',
    },
    buttonContainer: {
        marginBottom: 50,
        gap: 15,
    },
    buttonPrimary: {
        backgroundColor: '#fbbf24', // Yellow button
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonPrimaryText: {
        color: '#0f172a', // Dark text on yellow
        fontSize: 18,
        fontWeight: '600',
    },
    buttonSecondary: {
        backgroundColor: '#1e293b', // Darker gray button
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155', // Subtle border
    },
    buttonSecondaryText: {
        color: '#f8fafc', // Light text
        fontSize: 18,
        fontWeight: '600',
    },
});
