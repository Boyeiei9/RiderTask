import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useOrderStore } from '../../hooks/useOrderStore';

export default function RouteSearchScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type: 'origin' | 'destination' }>(); // Optional: If we want auto-focus based on entry point
    const { origin, setOrigin, destination, setDestination } = useOrderStore();

    const [originText, setOriginText] = useState(origin?.address || '');
    const [destText, setDestText] = useState(destination?.address || '');

    const [activeInput, setActiveInput] = useState<'origin' | 'destination'>(type || 'origin');

    useEffect(() => {
        if (origin) setOriginText(origin.address);
        else setOriginText('');
    }, [origin]);

    useEffect(() => {
        if (destination) setDestText(destination.address);
        else setDestText('');
    }, [destination]);

    const handleSelectPlace = (place: any) => {
        const placeData = {
            address: place.name,
            latitude: place.lat,
            longitude: place.lng
        };

        if (activeInput === 'origin') {
            setOrigin(placeData);
            setOriginText(place.name);
            // Auto switch to destination if empty
            if (!destText) setActiveInput('destination');
            else router.back();
        } else {
            setDestination(placeData);
            setDestText(place.name);
            // Both selected -> map route
            if (originText) router.back();
        }
    };

    const handleOpenMapPicker = () => {
        router.push(`/(sender)/map-picker?type=${activeInput}` as any);
    };

    return (
        <View style={styles.container}>
            {/* Header / Search Inputs */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="close" size={28} color="#f8fafc" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>เส้นทางของคุณ</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.searchBox}>
                    <View style={styles.inputTimeline}>
                        <View style={styles.dotOrigin} />
                        <View style={styles.line} />
                        <View style={styles.dotDest} />
                    </View>

                    <View style={styles.inputsContainer}>
                        {/* Origin Input */}
                        <View style={[styles.inputWrapper, activeInput === 'origin' && styles.activeWrapper]}>
                            <TextInput
                                style={styles.input}
                                value={originText}
                                onChangeText={(text) => {
                                    setOriginText(text);
                                    if (text === '') setOrigin(null);
                                }}
                                placeholder="จุดรับของ"
                                placeholderTextColor="#64748b"
                                onFocus={() => setActiveInput('origin')}
                            />
                            {originText.length > 0 && (
                                <TouchableOpacity style={styles.clearIcon} onPress={() => { setOriginText(''); setOrigin(null); }}>
                                    <Ionicons name="close-circle" size={18} color="#64748b" />
                                </TouchableOpacity>
                            )}
                            {activeInput === 'origin' && (
                                <TouchableOpacity style={styles.mapIcon} onPress={handleOpenMapPicker}>
                                    <FontAwesome5 name="map-marked-alt" size={20} color="#fbbf24" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.divider} />

                        {/* Destination Input */}
                        <View style={[styles.inputWrapper, activeInput === 'destination' && styles.activeWrapper]}>
                            <TextInput
                                style={styles.input}
                                value={destText}
                                onChangeText={(text) => {
                                    setDestText(text);
                                    if (text === '') setDestination(null);
                                }}
                                placeholder="จุดหมายปลายทาง"
                                placeholderTextColor="#64748b"
                                onFocus={() => setActiveInput('destination')}
                            />
                            {destText.length > 0 && (
                                <TouchableOpacity style={styles.clearIcon} onPress={() => { setDestText(''); setDestination(null); }}>
                                    <Ionicons name="close-circle" size={18} color="#64748b" />
                                </TouchableOpacity>
                            )}
                            {activeInput === 'destination' && (
                                <TouchableOpacity style={styles.mapIcon} onPress={handleOpenMapPicker}>
                                    <FontAwesome5 name="map-marked-alt" size={20} color="#fbbf24" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.swapButton}>
                        <MaterialIcons name="swap-vert" size={24} color="#94a3b8" />
                    </TouchableOpacity>
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
        backgroundColor: '#1e293b',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 15,
        elevation: 4,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    inputTimeline: {
        alignItems: 'center',
        marginRight: 15,
        marginTop: 5,
        marginBottom: 5,
    },
    dotOrigin: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3b82f6', // Blue circle
        borderWidth: 2,
        borderColor: '#1e293b',
    },
    line: {
        width: 2,
        height: 35,
        backgroundColor: '#334155',
        marginVertical: 4,
    },
    dotDest: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#transparent',
        borderWidth: 2,
        borderColor: '#f97316', // Orange circle
    },
    inputsContainer: {
        flex: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 8,
    },
    activeWrapper: {
        backgroundColor: '#1e293b',
    },
    input: {
        flex: 1,
        color: '#f8fafc',
        fontSize: 16,
        paddingHorizontal: 10,
    },
    mapIcon: {
        padding: 10,
    },
    clearIcon: {
        padding: 5,
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#334155',
        marginVertical: 2,
    },
    swapButton: {
        padding: 10,
        marginLeft: 5,
    }
});
