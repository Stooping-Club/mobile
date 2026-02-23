import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
  Alert,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import { useItems } from '@/store/items-context';
import { useAuth } from '@/store/auth-context';
import { Item } from '@/types';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from '@/constants/theme';
import { getCategoryDef } from '@/constants/categories';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/items/status-badge';
import { Button } from '@/components/ui/button';
import { formatTimeAgo, formatWeight } from '@/lib/format';
import { analytics } from '@/lib/analytics';

const { width, height } = Dimensions.get('window');

// ─── Image Carousel ───────────────────────────────────────────────────────────

function ImageCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<FlatList>(null);

  return (
    <View style={styles.carousel}>
      <FlatList
        ref={scrollRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrent(index);
        }}
        renderItem={({ item: uri }) => (
          <Image
            source={{ uri }}
            style={{ width, height: CAROUSEL_HEIGHT }}
            contentFit="cover"
          />
        )}
      />
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === current && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Quick Message Templates ──────────────────────────────────────────────────

const MESSAGE_TEMPLATES = [
  { id: '1', emoji: '❓', text: 'Is this still available?' },
  { id: '2', emoji: '🚶', text: 'I can pick up today!' },
  { id: '3', emoji: '📅', text: 'I can pick up this weekend' },
  { id: '4', emoji: '🙏', text: 'Is there any flexibility?' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

const CAROUSEL_HEIGHT = 320;

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItemById, markInterested, updateItemStatus, incrementView } = useItems();
  const { user } = useAuth();
  const [interested, setInterested] = useState(false);
  const [viewerCount] = useState(Math.floor(Math.random() * 5) + 1);
  const heartAnim = useRef(new Animated.Value(1)).current;

  const item = getItemById(id);

  useEffect(() => {
    if (item) {
      incrementView(item.id);
      analytics.track('item_viewed', { itemId: item.id, category: item.category });
    }
  }, [item?.id]);

  if (!item) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = getCategoryDef(item.category);
  const isOwner = user?.id === item.userId;

  const handleInterest = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setInterested(true);
    markInterested(item.id);

    // Animate heart
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1.4, useNativeDriver: true, tension: 200 }),
      Animated.spring(heartAnim, { toValue: 1, useNativeDriver: true, tension: 100 }),
    ]).start();
  };

  const handleClaim = () => {
    if (!user) { router.push('/auth'); return; }
    Alert.alert(
      'Mark as Claimed?',
      'This will mark the item as claimed and hide it from search.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Claimed',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            updateItemStatus(item.id, 'claimed');
            router.back();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: item.title,
        message: `Check out this free item on Berkeley Stooping: ${item.title} — ${item.address ?? 'Berkeley, CA'}`,
      });
      analytics.track('item_shared', { itemId: item.id });
    } catch {}
  };

  const handleReport = () => {
    Alert.alert(
      'Report Item',
      'Why are you reporting this item?',
      [
        { text: 'Inappropriate content', onPress: () => {} },
        { text: 'Spam', onPress: () => {} },
        { text: 'Unsafe pickup', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Image carousel */}
        <ImageCarousel images={item.images} />

        {/* Back button (floating) */}
        <SafeAreaView style={styles.floatingBar} edges={['top']} pointerEvents="box-none">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.floatingRight}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionBtnIcon}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleReport}>
              <Text style={styles.actionBtnIcon}>⚠</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Content */}
        <View style={styles.content}>
          {/* Status + category */}
          <View style={styles.topRow}>
            <StatusBadge status={item.status} />
            <View style={[styles.categoryChip, { backgroundColor: category.color + '20' }]}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[styles.categoryLabel, { color: category.color }]}>
                {category.label}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Real-time viewer count */}
          {viewerCount > 1 && item.status === 'available' && (
            <View style={styles.viewerBadge}>
              <View style={styles.viewerDot} />
              <Text style={styles.viewerText}>
                {viewerCount} people viewing right now
              </Text>
            </View>
          )}

          {/* Location + time */}
          <View style={styles.metaRow}>
            <Text style={styles.location}>📍 {item.address ?? 'Berkeley, CA'}</Text>
            <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={styles.stat}>👁 {item.viewCount + 1} views</Text>
            <Text style={styles.stat}>❤️ {item.interestedCount + (interested ? 1 : 0)} interested</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Poster */}
          <TouchableOpacity style={styles.posterRow} activeOpacity={0.8}>
            <Avatar user={item.user} size={48} showBadge />
            <View style={styles.posterInfo}>
              <Text style={styles.posterName}>@{item.user?.username ?? 'poster'}</Text>
              <View style={styles.posterMeta}>
                {item.user?.verified && (
                  <Text style={styles.verifiedText}>✅ Verified </Text>
                )}
                <Text style={styles.posterRating}>
                  ⭐ {item.user?.rating.toFixed(1)} ({item.user?.ratingCount} reviews)
                </Text>
              </View>
              <Text style={styles.posterStats}>
                {item.user?.itemsPosted} items posted · {item.user?.itemsClaimed} claimed
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>About this item</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Tags */}
          {item.tags.length > 0 && (
            <View style={styles.tags}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Pickup method */}
          <Text style={styles.sectionTitle}>Pickup</Text>
          <View style={styles.pickupCard}>
            <Text style={styles.pickupEmoji}>
              {item.pickupMethod === 'curb' ? '🚶' : item.pickupMethod === 'scheduled' ? '📅' : '💬'}
            </Text>
            <View>
              <Text style={styles.pickupTitle}>
                {item.pickupMethod === 'curb'
                  ? 'Curb pickup'
                  : item.pickupMethod === 'scheduled'
                  ? 'Scheduled pickup'
                  : 'Contact poster'}
              </Text>
              <Text style={styles.pickupSub}>
                {item.pickupMethod === 'curb'
                  ? 'Item is at the curb — grab it anytime'
                  : item.pickupMethod === 'scheduled'
                  ? 'Coordinate a pickup time with the poster'
                  : 'Message the poster to arrange pickup'}
              </Text>
            </View>
          </View>

          {/* Environmental impact */}
          {item.weightEstimateLbs && (
            <View style={styles.impactRow}>
              <Text style={styles.impactText}>
                🌍 Claiming this item keeps ~{formatWeight(item.weightEstimateLbs)} from landfill
              </Text>
            </View>
          )}

          {/* Quick messages (non-owner, available) */}
          {!isOwner && item.status === 'available' && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Quick Messages</Text>
              <View style={styles.quickMessages}>
                {MESSAGE_TEMPLATES.map((tmpl) => (
                  <TouchableOpacity
                    key={tmpl.id}
                    style={styles.quickMessage}
                    onPress={() => {
                      if (!user) { router.push('/auth'); return; }
                      Haptics.selectionAsync();
                      Alert.alert('Message Sent!', `"${tmpl.text}" sent to poster.`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickMessageEmoji}>{tmpl.emoji}</Text>
                    <Text style={styles.quickMessageText}>{tmpl.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Owner controls */}
          {isOwner && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Manage Your Item</Text>
              <View style={styles.ownerControls}>
                {item.status !== 'claimed' && (
                  <Button
                    label="Mark as Claimed"
                    onPress={handleClaim}
                    variant="primary"
                    fullWidth
                  />
                )}
                {item.status === 'pending' && (
                  <Button
                    label="Mark Still Available"
                    onPress={() => updateItemStatus(item.id, 'available')}
                    variant="outline"
                    fullWidth
                    style={{ marginTop: Spacing.sm }}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      {!isOwner && item.status === 'available' && (
        <SafeAreaView style={styles.stickyBar} edges={['bottom']}>
          <Animated.View style={{ transform: [{ scale: heartAnim }], flex: 1 }}>
            <Button
              label={interested ? '❤️ You\'re interested!' : 'I want this!'}
              onPress={handleInterest}
              variant={interested ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              disabled={interested}
            />
          </Animated.View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Carousel
  carousel: { position: 'relative' },
  dots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: Colors.textInverse, width: 16 },

  // Floating header
  floatingBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: 4,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnIcon: { color: Colors.textInverse, fontSize: 26, fontWeight: '300', marginTop: -2 },
  floatingRight: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnIcon: { color: Colors.textInverse, fontSize: 16 },

  // Content
  content: {
    padding: Spacing.base,
    backgroundColor: Colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryEmoji: { fontSize: 13 },
  categoryLabel: { fontSize: FontSize.xs, fontWeight: '700' },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.black,
    color: Colors.text,
    lineHeight: 30,
    marginBottom: Spacing.sm,
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  viewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  viewerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  location: { fontSize: FontSize.sm, color: Colors.textSecondary },
  time: { fontSize: FontSize.sm, color: Colors.textTertiary },
  statsRow: { flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.base },
  stat: { fontSize: FontSize.xs, color: Colors.textTertiary },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.base,
  },

  // Poster
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  posterInfo: { flex: 1 },
  posterName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  posterMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  verifiedText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  posterRating: { fontSize: FontSize.xs, color: Colors.textSecondary },
  posterStats: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },

  // Description
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.full,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },

  // Pickup
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  pickupEmoji: { fontSize: 24 },
  pickupTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  pickupSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },

  // Impact
  impactRow: {
    padding: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  impactText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500' },

  // Quick messages
  quickMessages: { gap: Spacing.sm },
  quickMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  quickMessageEmoji: { fontSize: 20 },
  quickMessageText: { fontSize: FontSize.base, color: Colors.text, fontWeight: '500' },

  // Owner controls
  ownerControls: { gap: Spacing.sm },

  // Sticky bar
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary },
  backLink: { fontSize: FontSize.base, color: Colors.primary },
});
