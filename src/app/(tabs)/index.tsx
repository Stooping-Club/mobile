import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type Product,
  type SortOption,
  SORT_OPTIONS,
  formatPrice,
  getProducts,
} from '@/lib/shopify';

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const image = product.featuredImage;
  const price = product.priceRange.minVariantPrice;

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.handle}`)}
      className="flex-1 p-2"
    >
      <View className="overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
        {image && (
          <Image
            source={{ uri: image.url }}
            style={{ width: '100%', aspectRatio: 1 }}
            contentFit="cover"
            transition={200}
          />
        )}
        <View className="p-3">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
            {product.vendor}
          </Text>
          <Text className="mt-0.5 text-base font-medium dark:text-white" numberOfLines={2}>
            {product.title}
          </Text>
          <Text className="mt-1 text-base font-semibold dark:text-white">
            {formatPrice(price)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function SortBar({
  active,
  onSelect,
}: {
  active: SortOption;
  onSelect: (option: SortOption) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-2 py-2 gap-2"
      >
        {SORT_OPTIONS.map((option) => {
          const isActive =
            option.sortKey === active.sortKey && option.reverse === active.reverse;
          return (
            <Pressable
              key={option.label}
              onPress={() => onSelect(option)}
              className={`rounded-full px-4 py-1.5 ${
                isActive
                  ? 'bg-black dark:bg-white'
                  : 'bg-neutral-100 dark:bg-neutral-800'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive
                    ? 'text-white dark:text-black'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const cursorRef = useRef<string | undefined>(undefined);
  const fetchingRef = useRef(false);
  const sortRef = useRef(sort);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (reset = false) => {
    if (fetchingRef.current && !reset) return;
    fetchingRef.current = true;
    try {
      setError(null);
      if (reset) cursorRef.current = undefined;
      const { sortKey, reverse } = sortRef.current;
      const result = await getProducts(20, cursorRef.current, sortKey, reverse);
      const newProducts = result.edges.map((e) => e.node);

      setProducts(reset ? newProducts : (prev) => [...prev, ...newProducts]);
      cursorRef.current = result.pageInfo.endCursor ?? undefined;
      setHasMore(result.pageInfo.hasNextPage);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(true);
  }, []);

  const onSortChange = useCallback(
    (option: SortOption) => {
      setSort(option);
      sortRef.current = option;
      setLoading(true);
      fetchProducts(true);
    },
    [fetchProducts],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(true);
  }, [fetchProducts]);

  const onEndReached = useCallback(() => {
    if (hasMore) {
      fetchProducts();
    }
  }, [hasMore, fetchProducts]);

  if (loading && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
        <Text className="text-center text-base text-red-500">{error}</Text>
        <Pressable
          onPress={() => {
            setLoading(true);
            fetchProducts(true);
          }}
          className="mt-4 rounded-lg bg-black px-6 py-3 dark:bg-white"
        >
          <Text className="font-medium text-white dark:text-black">Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <FlatList
      data={products}
      numColumns={2}
      keyExtractor={(item) => item.handle}
      renderItem={({ item }) => <ProductCard product={item} />}
      ListHeaderComponent={<SortBar active={sort} onSelect={onSortChange} />}
      stickyHeaderIndices={[0]}
      contentContainerClassName="pb-28"
      className="bg-white dark:bg-black"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading && products.length > 0 ? (
          <ActivityIndicator className="py-4" />
        ) : null
      }
    />
  );
}
