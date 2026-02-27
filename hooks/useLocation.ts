import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            // Usage of fetch technique for reverse geocoding
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`,
                    {
                        headers: {
                            'User-Agent': 'ThunderGoApp/1.0 (Contact: support@thundergo.com)',
                            'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8'
                        }
                    }
                );
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                const data = await response.json();
                setAddress(data.display_name || 'Unknown Location');
            } catch (e) {
                console.error('Reverse Geocoding Error:', e);
                setAddress('Cannot fetch address name');
            }
        })();
    }, []);

    return { location, address, errorMsg };
};
