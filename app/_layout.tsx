import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../hooks/useAuth';
import { OrderProvider } from '../hooks/useOrderStore'; // Added import for OrderProvider

function RootNavigation() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(sender)" />
      <Stack.Screen name="(rider)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <OrderProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootNavigation />
          <StatusBar style="dark" />
        </GestureHandlerRootView>
      </OrderProvider>
    </AuthProvider>
  );
}
