import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Story } from '@/types';
import { Colors, Radius, FontSize, FontWeight, Spacing, Shadow } from '@/constants/theme';
import { Avatar } from '@/components/ui/avatar';
import { formatTimeAgo } from '@/lib/format';
import { useItems } from '@/store/items-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.base * 2;

const STORY_TYPE_LABELS = {
  find: '🎉 New Find',
  transformation: '✨ Transformation',
  setup: '🏠 Room Setup',
};

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const { reactToStory } = useItems();

  const handleReaction = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reactToStory(story.id, emoji);
  };

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: story.images[0] }}
          style={styles.image}
          contentFit="cover"
          recyclingKey={story.id}
        />
        {/* Story type label */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{STORY_TYPE_LABELS[story.type]}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* User info */}
        <View style={styles.userRow}>
          <Avatar user={story.user} size={36} showBadge />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{story.user?.username ?? 'stooper'}</Text>
            <Text style={styles.time}>{formatTimeAgo(story.createdAt)}</Text>
          </View>
          {story.user?.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Caption */}
        {story.caption && (
          <Text style={styles.caption}>{story.caption}</Text>
        )}

        {/* Reactions */}
        <View style={styles.reactions}>
          {story.reactions.map((reaction) => (
            <TouchableOpacity
              key={reaction.emoji}
              onPress={() => handleReaction(reaction.emoji)}
              style={[
                styles.reactionBtn,
                story.userReaction === reaction.emoji && styles.reactionBtnActive,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text
                style={[
                  styles.reactionCount,
                  story.userReaction === reaction.emoji && styles.reactionCountActive,
                ]}
              >
                {reaction.count > 0 ? reaction.count : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  imageContainer: {
    height: 260,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.base,
    left: Spacing.base,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  typeText: {
    color: Colors.textInverse,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.base,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  userInfo: { flex: 1 },
  username: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  verifiedBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  verifiedText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  caption: {
    fontSize: FontSize.base,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  reactions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
  },
  reactionBtnActive: {
    backgroundColor: Colors.primaryLight,
  },
  reactionEmoji: { fontSize: 16 },
  reactionCount: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    minWidth: 16,
  },
  reactionCountActive: {
    color: Colors.primary,
  },
});
