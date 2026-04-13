import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSaved } from '@/context/saved';
import { Colors, Fonts, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ShopifyProduct, getNeighborhood, isAvailable } from '@/lib/shopify';

function SavedCard({ product }: { product: ShopifyProduct }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { toggleSaved } = useSaved();
  const neighborhood = getNeighborhood(product.tags);
  const available = isAvailable(product);

  return (
    <Link href={`/product/${product.handle}`} asChild>
      <Pressable style={[styles.card, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {product.featuredImage ? (
          <Image
            source={{ uri: product.featuredImage.url }}
            style={styles.thumb}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.thumb, styles.noImg, { backgroundColor: c.cardAlt }]}>
            <Text style={{ fontSize: 26 }}>📦</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: c.text, fontFamily: Fonts.sans }]} numberOfLines={2}>
            {product.title}
          </Text>
          {neighborhood && (
            <View style={styles.locationRow}>
              <IconSymbol name="mappin" size={11} color={c.tint} />
              <Text style={[styles.neighborhood, { color: c.textSecondary, fontFamily: Fonts.sans }]}>
                {neighborhood}
              </Text>
            </View>
          )}
          <View style={[
            styles.statusPill,
            { backgroundColor: available ? Palette.green : Palette.gray600 }
          ]}>
            <Text style={[styles.statusText, { fontFamily: Fonts.sansMedium }]}>
              {available ? 'Available' : 'Claimed'}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.unsaveBtn}
          onPress={(e) => { e.stopPropagation?.(); toggleSaved(product); }}
          hitSlop={8}
        >
          <IconSymbol name="bookmark.fill" size={22} color={Palette.green} />
        </Pressable>
      </Pressable>
    </Link>
  );
}

export default function SavedScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { savedItems } = useSaved();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text, fontFamily: Fonts.serifBold }]}>
          Saved Items
        </Text>
        {savedItems.length > 0 && (
          <Text style={[styles.headerCount, { color: c.textSecondary, fontFamily: Fonts.sans }]}>
            {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'}
          </Text>
        )}
      </View>

      {savedItems.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconWrap, { backgroundColor: c.cardAlt }]}>
            <IconSymbol name="bookmark" size={40} color={c.border} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.text, fontFamily: Fonts.serifBold }]}>
            Nothing saved yet
          </Text>
          <Text style={[styles.emptySub, { color: c.textSecondary, fontFamily: Fonts.sans }]}>
            Tap the bookmark icon on any item to save it for later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => <SavedCard product={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  headerTitle: { fontSize: 22 },
  headerCount: { fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
  },
  thumb: { width: 76, height: 76, borderRadius: 4 },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 5 },
  cardTitle: { fontSize: 14, lineHeight: 19 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  neighborhood: { fontSize: 12 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3 },
  statusText: { color: '#fff', fontSize: 11 },
  unsaveBtn: { padding: 4 },
});
