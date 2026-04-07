import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Product, formatPrice, searchProducts } from '@/lib/shopify';

function SearchResult({ product }: { product: Product }) {
  const router = useRouter();
  const image = product.featuredImage;
  const price = product.priceRange.minVariantPrice;

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.handle}`)}
      className="flex-row border-b border-neutral-100 px-4 py-3 dark:border-neutral-800"
    >
      {image && (
        <Image
          source={{ uri: image.url }}
          style={{ width: 72, height: 72, borderRadius: 10 }}
          contentFit="cover"
          transition={200}
        />
      )}
      <View className="ml-3 flex-1 justify-center">
        <Text className="text-sm text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
          {product.vendor}
        </Text>
        <Text className="mt-0.5 text-base font-medium dark:text-white" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="mt-1 text-sm font-semibold dark:text-white">
          {formatPrice(price)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const cursorRef = useRef<string | undefined>(undefined);
  const fetchingRef = useRef(false);
  const activeQueryRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (text: string, reset = true) => {
    if (fetchingRef.current && !reset) return;
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    fetchingRef.current = true;
    if (reset) {
      cursorRef.current = undefined;
      setLoading(true);
    }
    activeQueryRef.current = text;

    try {
      const data = await searchProducts(text.trim(), 20, reset ? undefined : cursorRef.current);
      const products = data.edges.map((e) => e.node);

      // Discard if query changed while fetching
      if (activeQueryRef.current !== text) return;

      setResults(reset ? products : (prev) => [...prev, ...products]);
      cursorRef.current = data.pageInfo.endCursor ?? undefined;
      setHasMore(data.pageInfo.hasNextPage);
      setSearched(true);
    } catch {
      // Silently ignore search errors
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  const onChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => doSearch(text, true), 400);
    },
    [doSearch],
  );

  const onEndReached = useCallback(() => {
    if (hasMore && query.trim()) {
      doSearch(query, false);
    }
  }, [hasMore, query, doSearch]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <View className="px-4 pb-2 pt-2">
        <View className="flex-row items-center rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
          <Text className="mr-2 text-base text-neutral-400">🔍</Text>
          <TextInput
            value={query}
            onChangeText={onChangeText}
            placeholder="Search products..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query, true)}
            className="flex-1 text-base dark:text-white"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery('');
                setResults([]);
                setSearched(false);
              }}
            >
              <Text className="text-base text-neutral-400">✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading && results.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.handle}
          renderItem={({ item }) => <SearchResult product={item} />}
          contentContainerClassName="pb-28"
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          keyboardDismissMode="on-drag"
          ListFooterComponent={
            loading ? <ActivityIndicator className="py-4" /> : null
          }
        />
      ) : searched ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-neutral-400 dark:text-neutral-500">
            No results found
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-neutral-400 dark:text-neutral-500">
            Search for products
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
