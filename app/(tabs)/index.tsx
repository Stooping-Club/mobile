import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { useItems } from '@/store/items-context';
import { useLocation } from '@/hooks/use-location';
import { CategoryFilter } from '@/components/items/category-filter';
import { NeighborhoodFilter } from '@/components/items/neighborhood-filter';
import { ItemCard } from '@/components/items/item-card';
import { StoopingMap } from '@/components/map/stooping-map';
import { ItemCardSkeleton } from '@/components/ui/skeleton';
import { StoryCard } from '@/components/social/story-card';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from '@/constants/theme';
import { COMMUNITY_STATS } from '@/constants/mock-data';
import { formatWeight } from '@/lib/format';

const { width } = Dimensions.get('window');

type TabMode = 'discover' | 'stories';

export default function BrowseScreen() {
  const { filteredItems, trendingItems, stories, loading, viewMode, setViewMode } =
    useItems();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('discover');
  const headerAnim = useRef(new Animated.Value(0)).current;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const renderHeader = () => (
    <View>
      {/* Trending Near You */}
      {trendingItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending Near You</Text>
            <TouchableOpacity onPress={() => router.push('/item/' + trendingItems[0].id)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: Spacing.base, gap: Spacing.sm }}
          >
            {trendingItems.map((item) => (
              <ItemCard key={item.id} item={item} compact />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Community Impact */}
      <TouchableOpacity activeOpacity={0.9} style={styles.impactBanner}>
        <Text style={styles.impactEmoji}>🌍</Text>
        <View style={styles.impactContent}>
          <Text style={styles.impactTitle}>Community Impact</Text>
          <Text style={styles.impactSub}>
            {formatWeight(COMMUNITY_STATS.totalWeightKeptFromLandfillLbs)} kept from landfill
            this year · {COMMUNITY_STATS.totalItems.toLocaleString()} items shared
          </Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.feedTitle}>Recent Items</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🪑</Text>
      <Text style={styles.emptyTitle}>Nothing here yet</Text>
      <Text style={styles.emptySub}>
        Be the first to post a free item in this area!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Floating header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.wordmark}>stooping</Text>
            <Text style={styles.subtitle}>📍 Berkeley, CA</Text>
          </View>
          <View style={styles.headerRight}>
            {/* View mode toggle */}
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  viewMode === 'map' && styles.toggleBtnActive,
                ]}
                onPress={() => setViewMode('map')}
              >
                <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
                  🗺 Map
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  viewMode === 'list' && styles.toggleBtnActive,
                ]}
                onPress={() => setViewMode('list')}
              >
                <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                  ≡ Feed
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab row: Discover / Stories */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
              Discover
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stories' && styles.tabActive]}
            onPress={() => setActiveTab('stories')}
          >
            <Text style={[styles.tabText, activeTab === 'stories' && styles.tabTextActive]}>
              Stories ✨
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {activeTab === 'discover' && (
          <>
            <CategoryFilter />
            <NeighborhoodFilter />
          </>
        )}
      </SafeAreaView>

      {/* Content area */}
      <View style={styles.content}>
        {activeTab === 'stories' ? (
          // Stories feed
          <FlatList
            data={stories}
            keyExtractor={(s) => s.id}
            renderItem={({ item }) => <StoryCard story={item} />}
            contentContainerStyle={styles.storiesContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
              />
            }
          />
        ) : viewMode === 'map' ? (
          // Map view
          <StoopingMap
            items={filteredItems}
            userLatitude={location.latitude}
            userLongitude={location.longitude}
          />
        ) : (
          // List feed
          <FlatList
            data={loading ? [] : filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ItemCard item={item} />}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              loading ? (
                <View>
                  <ItemCardSkeleton />
                  <ItemCardSkeleton />
                  <ItemCardSkeleton />
                </View>
              ) : (
                renderEmpty()
              )
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const HEADER_HEIGHT = 180;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
    ...Shadow.sm,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: 4,
    paddingBottom: Spacing.sm,
  },
  wordmark: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.black,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: Colors.surface,
    ...Shadow.xs,
  },
  toggleText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.text,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
    paddingBottom: 2,
  },
  tab: {
    paddingBottom: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  storiesContent: {
    paddingTop: Spacing.base,
    paddingBottom: 100,
  },

  // Section
  section: {
    marginBottom: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Impact banner
  impactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    padding: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  impactEmoji: { fontSize: 28 },
  impactContent: { flex: 1 },
  impactTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: 2,
  },
  impactSub: {
    fontSize: FontSize.xs,
    color: Colors.primaryDark,
    lineHeight: 16,
  },

  // Feed header
  feedTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: 4,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing['2xl'],
  },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.base },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
