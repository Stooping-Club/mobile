import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotificationsSetup } from '@/hooks/use-notifications';
import { AuthProvider } from '@/store/auth-context';
import { ItemsProvider } from '@/store/items-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useNotificationsSetup();

  return (
    <AuthProvider>
      <ItemsProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
            <Stack.Screen
              name="new-item"
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, gestureEnabled: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ItemsProvider>
    </AuthProvider>
  );
}
