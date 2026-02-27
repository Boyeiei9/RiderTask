import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../../services/firebase';

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: any;
}

export default function ChatScreen() {
    const { orderId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const user = auth.currentUser;

    useEffect(() => {
        if (!orderId) return;

        const q = query(
            collection(db, `orders/${orderId}/chats`),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setMessages(fetchedMessages);
        });

        return unsubscribe;
    }, [orderId]);

    const sendMessage = async () => {
        if (!inputText.trim() || !user || !orderId) return;

        const textToSend = inputText.trim();
        setInputText(''); // Optimistic UI clear

        try {
            await addDoc(collection(db, `orders/${orderId}/chats`), {
                text: textToSend,
                senderId: user.uid,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error sending message: ', error);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === user?.uid;

        return (
            <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={20} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>แชทกับคนขับ</Text>
                    <Text style={styles.headerSubtitle}>Order ID: {String(orderId).slice(-6)}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                inverted
                contentContainerStyle={styles.messageList}
            />

            <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 16 }]}>
                <TextInput
                    style={styles.input}
                    placeholder="พิมพ์ข้อความ..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!inputText.trim()}
                >
                    <Ionicons name="send" size={20} color={!inputText.trim() ? '#94a3b8' : '#fff'} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { fontSize: 13, color: '#64748b' },
    messageList: { padding: 16, gap: 12 },
    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
    myMessage: { alignSelf: 'flex-end', backgroundColor: '#fbbf24', borderBottomRightRadius: 4 },
    theirMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15 },
    myMessageText: { color: '#451a03' },
    theirMessageText: { color: '#334155' },
    inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'flex-end' },
    input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 100, color: '#1e293b' },
    sendButton: { width: 44, height: 44, backgroundColor: '#fbbf24', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
    sendButtonDisabled: { backgroundColor: '#e2e8f0' }
});
