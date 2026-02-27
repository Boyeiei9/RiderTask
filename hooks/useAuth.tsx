import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLocalUser, logoutUser } from '../services/authService';

interface AuthContextType {
    role: string | null;
    userId: string | null;
    loading: boolean;
    loginWithLocalUser: (role: string, userId: string) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const localUser = await getLocalUser();
                setRole(localUser.role);
                setUserId(localUser.userId);
            } catch (e) {
                console.error("Error fetching local user session", e);
            } finally {
                setLoading(false);
            }
        };
        checkLogin();
    }, []);

    // Global protection routing logic
    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inSenderGroup = segments[0] === '(sender)';
        const inRiderGroup = segments[0] === '(rider)';

        if (!role && !inAuthGroup && (inSenderGroup || inRiderGroup)) {
            // Redirect to welcome screen if trying to access protected route without role
            router.replace('/');
        } else if (role === 'sender' && !inSenderGroup) {
            router.replace('/(sender)');
        } else if (role === 'rider' && !inRiderGroup) {
            router.replace('/(rider)');
        }
    }, [role, loading, segments]);

    const logout = async () => {
        setLoading(true);
        await logoutUser();
        setRole(null);
        setUserId(null);
        setLoading(false);
        router.replace('/(auth)/login');
    };

    const loginWithLocalUser = (role: string, userId: string) => {
        setRole(role);
        setUserId(userId);
    };

    return (
        <AuthContext.Provider value={{ role, userId, loading, loginWithLocalUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
