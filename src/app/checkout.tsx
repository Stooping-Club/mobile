import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useCartStore } from '@/store/cart';

export default function CheckoutScreen() {
  const router = useRouter();
  const checkoutUrl = useCartStore((s) => s.cart?.checkoutUrl ?? null);
  const clear = useCartStore((s) => s.clear);

  if (!checkoutUrl) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          No checkout available
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <WebView
        source={{ uri: checkoutUrl }}
        startInLoadingState
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-white dark:bg-black">
            <ActivityIndicator size="large" />
          </View>
        )}
        onNavigationStateChange={(navState) => {
          // Shopify redirects to /thank_you after successful checkout
          if (navState.url.includes('/thank_you') || navState.url.includes('thank-you')) {
            clear();
            router.replace('/');
          }
        }}
      />
    </View>
  );
}
