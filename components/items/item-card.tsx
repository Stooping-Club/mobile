import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Item } from '@/types';
import {
  Colors,
  Radius,
  FontSize,
  FontWeight,
  Spacing,
  Shadow,
} from '@/constants/theme';
import { StatusBadge } from './status-badge';
import { getCategoryDef } from '@/constants/categories';
import { formatTimeAgo } from '@/lib/format';

const { width } = Dimensions.get('window');

interface ItemCardProps {
  item: Item;
  compact?: boolean;
}

export function ItemCard({ item, compact = false }: ItemCardProps) {
  const category = getCategoryDef(item.category);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/item/${item.id}`);
  };

  if (compact) {
    return <CompactItemCard item={item} category={category} onPress={handlePress} />;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.93}
      style={styles.card}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          recyclingKey={item.id}
        />
        {/* Status overlay */}
        <View style={styles.statusOverlay}>
          <StatusBadge status={item.status} size="sm" />
        </View>
        {/* Image count */}
        {item.images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Text style={styles.imageCountText}>+{item.images.length - 1}</Text>
          </View>
        )}
        {/* Category emoji */}
        <View style={[styles.categoryBubble, { backgroundColor: category.color + '22' }]}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.address ?? 'Berkeley, CA'}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={[styles.pickupBadge, { backgroundColor: Colors.surfaceMuted }]}>
            <Text style={styles.pickupText}>
              {item.pickupMethod === 'curb'
                ? '🚶 Curb'
                : item.pickupMethod === 'scheduled'
                ? '📅 Scheduled'
                : '💬 Contact'}
            </Text>
          </View>
          <View style={styles.stats}>
            <Text style={styles.stat}>👁 {item.viewCount}</Text>
            <Text style={styles.stat}>❤️ {item.interestedCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CompactItemCard({
  item,
  category,
  onPress,
}: {
  item: Item;
  category: ReturnType<typeof getCategoryDef>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.compactCard}>
      <Image
        source={{ uri: item.images[0] }}
        style={styles.compactImage}
        contentFit="cover"
        recyclingKey={item.id}
      />
      <View style={styles.compactContent}>
        <Text style={styles.compactEmoji}>{category.emoji}</Text>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <StatusBadge status={item.status} size="sm" />
        <Text style={styles.compactTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Map Bottom Card (used when a pin is selected) ────────────────────────────

export function MapItemCard({
  item,
  onPress,
}: {
  item: Item;
  onPress: () => void;
}) {
  const category = getCategoryDef(item.category);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.mapCard}>
      <Image
        source={{ uri: item.images[0] }}
        style={styles.mapCardImage}
        contentFit="cover"
        recyclingKey={`map_${item.id}`}
      />
      <View style={styles.mapCardContent}>
        <View style={styles.mapCardHeader}>
          <Text style={styles.mapCardEmoji}>{category.emoji}</Text>
          <StatusBadge status={item.status} size="sm" />
        </View>
        <Text style={styles.mapCardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.mapCardLocation} numberOfLines={1}>
          📍 {item.address ?? 'Berkeley, CA'}
        </Text>
        <Text style={styles.mapCardTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Full card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  imageCountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  imageCountText: {
    color: Colors.textInverse,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  categoryBubble: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: { fontSize: 16 },
  content: { padding: Spacing.base },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  location: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pickupText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stat: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },

  // Compact card
  compactCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginRight: Spacing.sm,
    ...Shadow.sm,
  },
  compactImage: {
    width: 140,
    height: 100,
  },
  compactContent: {
    padding: Spacing.sm,
    gap: 4,
  },
  compactEmoji: { fontSize: 14 },
  compactTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 16,
  },
  compactTime: {
    fontSize: FontSize['2xs'],
    color: Colors.textTertiary,
    marginTop: 2,
  },

  // Map card
  mapCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  mapCardImage: {
    width: 100,
    height: 100,
  },
  mapCardContent: {
    flex: 1,
    padding: Spacing.md,
    gap: 4,
  },
  mapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapCardEmoji: { fontSize: 18 },
  mapCardTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    lineHeight: 20,
  },
  mapCardLocation: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  mapCardTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
