import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from '@expo-google-fonts/libre-baskerville';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth';
import { SavedProvider } from '@/context/saved';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SavedProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[handle]"
              options={{ headerShown: false, presentation: 'card' }}
            />
          </Stack>
          <StatusBar style="auto" />
        </SavedProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
