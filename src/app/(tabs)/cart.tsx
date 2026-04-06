import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatPrice } from '@/lib/shopify';
import { useCartStore } from '@/store/cart';

export default function CartScreen() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const loading = useCartStore((s) => s.loading);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);

  if (lines.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-lg text-neutral-500 dark:text-neutral-400">
          Your cart is empty
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-lg bg-black px-6 py-3 dark:bg-white"
        >
          <Text className="font-medium text-white dark:text-black">Continue Shopping</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1 px-4 pt-4">
        {lines.map((line) => {
          const image = line.merchandise.image ?? line.merchandise.product.featuredImage;
          return (
            <View
              key={line.id}
              className="mb-4 flex-row rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900"
            >
              {image && (
                <Image
                  source={{ uri: image.url }}
                  style={{ width: 80, height: 80, borderRadius: 8 }}
                  contentFit="cover"
                />
              )}
              <View className="ml-3 flex-1 justify-between">
                <View>
                  <Text className="text-base font-medium dark:text-white" numberOfLines={2}>
                    {line.merchandise.product.title}
                  </Text>
                  {line.merchandise.title !== 'Default Title' && (
                    <Text className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                      {line.merchandise.title}
                    </Text>
                  )}
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() => updateItem(line.id, line.quantity - 1)}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-700"
                    >
                      <Text className="text-base font-bold dark:text-white">−</Text>
                    </Pressable>
                    <Text className="min-w-[20px] text-center text-base font-medium dark:text-white">
                      {line.quantity}
                    </Text>
                    <Pressable
                      onPress={() => updateItem(line.id, line.quantity + 1)}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-700"
                    >
                      <Text className="text-base font-bold dark:text-white">+</Text>
                    </Pressable>
                  </View>
                  <Text className="text-base font-semibold dark:text-white">
                    {formatPrice(line.merchandise.price)}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => removeItem(line.id)}
                className="ml-2 self-start p-1"
              >
                <Text className="text-lg text-neutral-400">✕</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-white/60 dark:bg-black/60">
          <ActivityIndicator size="large" />
        </View>
      )}

      <View className="border-t border-neutral-200 px-4 pb-24 pt-4 dark:border-neutral-800">
        {cart && (
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base text-neutral-500 dark:text-neutral-400">Subtotal</Text>
            <Text className="text-xl font-bold dark:text-white">
              {formatPrice(cart.cost.subtotalAmount)}
            </Text>
          </View>
        )}
        <Pressable
          onPress={() => router.push('/checkout')}
          className="items-center rounded-xl bg-black py-4 dark:bg-white"
        >
          <Text className="text-base font-semibold text-white dark:text-black">
            Checkout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
