import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  type Product,
  type ProductVariant,
  formatPrice,
  getProductByHandle,
} from '@/lib/shopify';
import { useCartStore } from '@/store/cart';

const screenWidth = Dimensions.get('window').width;

function ImageCarousel({ images }: { images: Product['images'] }) {
  const allImages = images.edges.map((e) => e.node);

  if (allImages.length === 0) return null;

  return (
    <FlatList
      data={allImages}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Image
          source={{ uri: item.url }}
          style={{ width: screenWidth, aspectRatio: 1 }}
          contentFit="cover"
          transition={200}
        />
      )}
    />
  );
}

function VariantPicker({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductVariant[];
  selected: ProductVariant;
  onSelect: (v: ProductVariant) => void;
}) {
  if (variants.length <= 1 && variants[0]?.title === 'Default Title') return null;

  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
        Variant
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = v.id === selected.id;
          return (
            <Pressable
              key={v.id}
              onPress={() => onSelect(v)}
              className={`rounded-lg border px-4 py-2 ${
                isSelected
                  ? 'border-black bg-black dark:border-white dark:bg-white'
                  : 'border-neutral-300 dark:border-neutral-600'
              } ${!v.availableForSale ? 'opacity-40' : ''}`}
              disabled={!v.availableForSale}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-white dark:text-black' : 'dark:text-white'
                }`}
              >
                {v.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProductScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.loading);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    getProductByHandle(handle)
      .then((p) => {
        setProduct(p);
        if (p) {
          setSelectedVariant(p.variants.edges[0]?.node ?? null);
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [handle]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    await addItem(selectedVariant.id);
    setAdding(false);
    router.push('/cart');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
        <Text className="text-center text-base text-red-500">
          {error ?? 'Product not found'}
        </Text>
      </SafeAreaView>
    );
  }

  const variants = product.variants.edges.map((e) => e.node);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1">
        <ImageCarousel images={product.images} />

        <View className="px-4 pb-8 pt-4">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {product.vendor}
          </Text>
          <Text className="mt-1 text-2xl font-bold dark:text-white">{product.title}</Text>

          {selectedVariant && (
            <View className="mt-2 flex-row items-center gap-2">
              <Text className="text-xl font-semibold dark:text-white">
                {formatPrice(selectedVariant.price)}
              </Text>
              {selectedVariant.compareAtPrice && (
                <Text className="text-base text-neutral-400 line-through">
                  {formatPrice(selectedVariant.compareAtPrice)}
                </Text>
              )}
            </View>
          )}

          <VariantPicker
            variants={variants}
            selected={selectedVariant!}
            onSelect={setSelectedVariant}
          />

          {product.description.length > 0 && (
            <View className="mt-6">
              <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Description
              </Text>
              <Text className="text-base leading-6 dark:text-neutral-200">
                {product.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="border-t border-neutral-200 px-4 pb-8 pt-4 dark:border-neutral-800">
        <Pressable
          onPress={handleAddToCart}
          disabled={adding || cartLoading || !selectedVariant?.availableForSale}
          className={`items-center rounded-xl py-4 ${
            selectedVariant?.availableForSale
              ? 'bg-black dark:bg-white'
              : 'bg-neutral-300 dark:bg-neutral-700'
          }`}
        >
          {adding || cartLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-semibold text-white dark:text-black">
              {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
