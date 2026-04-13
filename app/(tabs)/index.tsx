import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSaved } from '@/context/saved';
import {
  GET_PRODUCTS_QUERY,
  IS_PLACEHOLDER_CONFIG,
  MOCK_PRODUCTS,
  ShopifyProduct,
  getNeighborhood,
  isAvailable,
  storefrontFetch,
} from '@/lib/shopify';
import { Colors, Fonts, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const LOGO_URI =
  'https://berkeleystooping.org/cdn/shop/files/Stooping_Club_Logo-removebg-preview.png';

const ITEMS_PER_PAGE = 24;

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'Books', value: 'books' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Plants', value: 'plants' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Toys', value: 'toys' },
  { label: 'Art', value: 'art' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StoopCard({ product }: { product: ShopifyProduct }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(product.id);
  const neighborhood = getNeighborhood(product.tags);
  const available = isAvailable(product);

  return (
    <Link href={`/product/${product.handle}`} asChild>
      <Pressable style={[styles.card, { backgroundColor: c.card }]}>
        <View style={styles.imageWrap}>
          {product.featuredImage ? (
            <Image
              source={{ uri: product.featuredImage.url }}
              style={styles.cardImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.noImage, { backgroundColor: c.cardAlt }]}>
              <Text style={{ fontSize: 36 }}>📦</Text>
            </View>
          )}

          {!available && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutText}>Claimed</Text>
            </View>
          )}

          <Pressable
            style={styles.saveBtn}
            onPress={(e) => { e.stopPropagation?.(); toggleSaved(product); }}
            hitSlop={8}
          >
            <IconSymbol
              name={saved ? 'bookmark.fill' : 'bookmark'}
              size={18}
              color={saved ? Palette.green : Palette.white}
            />
          </Pressable>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: c.text, fontFamily: Fonts.sans }]} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={[styles.freePrice, { color: c.tint, fontFamily: Fonts.sansBold }]}>
              Free
            </Text>
            {neighborhood && (
              <Text style={[styles.neighborhood, { color: c.textSecondary, fontFamily: Fonts.sans }]}>
                {neighborhood}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function BrowseScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async (query: string, category: string, after?: string) => {
    if (IS_PLACEHOLDER_CONFIG) {
      let results = MOCK_PRODUCTS;
      if (query) {
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        );
      }
      if (category) {
        results = results.filter((p) =>
          p.tags.some((t) => t.toLowerCase() === category.toLowerCase())
        );
      }
      setProducts(results);
      setHasNextPage(false);
      setCursor(null);
      return;
    }

    try {
      const parts: string[] = [];
      if (query) parts.push(`(title:*${query}* OR tag:*${query}*)`);
      if (category) parts.push(`tag:${category}`);
      const shopifyQuery = parts.length ? parts.join(' AND ') : undefined;

      const data = await storefrontFetch<{
        products: {
          pageInfo: { hasNextPage: boolean; endCursor: string };
          nodes: ShopifyProduct[];
        };
      }>(GET_PRODUCTS_QUERY, { first: ITEMS_PER_PAGE, after, query: shopifyQuery });

      const { nodes, pageInfo } = data.products;
      if (after) {
        setProducts((prev) => [...prev, ...nodes]);
      } else {
        setProducts(nodes);
      }
      setHasNextPage(pageInfo.hasNextPage);
      setCursor(pageInfo.endCursor);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load items');
    }
  }, []);

  const load = useCallback(
    async (query = search, category = activeCategory) => {
      setLoading(true);
      setError(null);
      await fetchProducts(query, category);
      setLoading(false);
    },
    [fetchProducts, search, activeCategory]
  );

  useEffect(() => { load('', ''); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts(search, activeCategory);
    setRefreshing(false);
  }, [fetchProducts, search, activeCategory]);

  const onLoadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore) return;
    setLoadingMore(true);
    await fetchProducts(search, activeCategory, cursor ?? undefined);
    setLoadingMore(false);
  }, [hasNextPage, loadingMore, fetchProducts, search, activeCategory, cursor]);

  const onSearchChange = useCallback(
    (text: string) => {
      setSearch(text);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => load(text, activeCategory), 400);
    },
    [load, activeCategory]
  );

  const onCategoryPress = useCallback(
    (value: string) => {
      setActiveCategory(value);
      load(search, value);
    },
    [load, search]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>

      <View style={[styles.header, { backgroundColor: c.headerBg, borderBottomColor: c.border }]}>
        <Image source={{ uri: LOGO_URI }} style={styles.logo} contentFit="contain" />
        <Text style={[styles.storeName, { color: c.text, fontFamily: Fonts.serifBold }]}>
          Stooping Club
        </Text>
        <Text style={[styles.tagline, { color: c.textSecondary, fontFamily: Fonts.sans }]}>
          Shop for Free, Anytime
        </Text>
      </View>

      <View style={[styles.searchRow, { backgroundColor: c.headerBg, borderBottomColor: c.border }]}>
        <View style={[
          styles.searchBar,
          { backgroundColor: c.cardAlt, borderColor: searchFocused ? c.tint : c.border }
        ]}>
          <IconSymbol name="magnifyingglass" size={15} color={c.icon} />
          <TextInput
            style={[styles.searchInput, { color: c.text, fontFamily: Fonts.sans }]}
            placeholder="Search items..."
            placeholderTextColor={c.textSecondary}
            value={search}
            onChangeText={onSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={15} color={c.icon} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.filterWrap, { borderBottomColor: c.border }]}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = activeCategory === item.value;
            return (
              <Pressable
                style={[
                  styles.filterPill,
                  active
                    ? { backgroundColor: c.tint, borderColor: c.tint }
                    : { backgroundColor: 'transparent', borderColor: c.border },
                ]}
                onPress={() => onCategoryPress(item.value)}
              >
                <Text style={[
                  styles.filterPillText,
                  { color: active ? Palette.white : c.textSecondary, fontFamily: Fonts.sansMedium }
                ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {IS_PLACEHOLDER_CONFIG && (
        <View style={[styles.demoBanner, { backgroundColor: Palette.gold }]}>
          <Text style={[styles.demoBannerText, { fontFamily: Fonts.sansMedium }]}>
            Demo mode — add Shopify credentials in lib/shopify.ts to go live
          </Text>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={c.tint} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: c.textSecondary, fontFamily: Fonts.sans }]}>{error}</Text>
          <Pressable onPress={() => load()} style={[styles.retryBtn, { borderColor: c.tint }]}>
            <Text style={[styles.retryText, { color: c.tint, fontFamily: Fonts.sansBold }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[styles.grid, { backgroundColor: c.background }]}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <StoopCard product={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={c.tint}
              colors={[c.tint]}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator color={c.tint} style={{ margin: 20 }} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: c.textSecondary, fontSize: 15, fontFamily: Fonts.sans }}>
                No items found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const CARD_GAP = 10;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 2,
  },
  logo: { width: 64, height: 52 },
  storeName: { fontSize: 20, letterSpacing: 0.2 },
  tagline: { fontSize: 12, opacity: 0.7 },
  searchRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterWrap: { borderBottomWidth: 1 },
  filterList: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 13 },
  demoBanner: {
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 6,
    padding: 8,
  },
  demoBannerText: { fontSize: 12, color: Palette.black, textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { fontSize: 14 },
  grid: { padding: CARD_GAP, paddingBottom: 32 },
  row: { gap: CARD_GAP, marginBottom: CARD_GAP },
  card: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  imageWrap: { position: 'relative' },
  cardImage: { width: '100%', aspectRatio: 1 },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  soldOutOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  soldOutText: { color: '#fff', fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  saveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 5,
  },
  cardBody: { paddingHorizontal: 8, paddingVertical: 10, gap: 4 },
  cardTitle: { fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  freePrice: { fontSize: 13 },
  neighborhood: { fontSize: 11, opacity: 0.8 },
});
