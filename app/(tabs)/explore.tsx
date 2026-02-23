import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { MOCK_CONVERSATIONS } from '@/constants/mock-data';
import { Conversation } from '@/types';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from '@/constants/theme';
import { Avatar } from '@/components/ui/avatar';
import { formatTimeAgo } from '@/lib/format';
import { useAuth } from '@/store/auth-context';

// ─── Quick Replies ────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  'Is this still available?',
  'I can pick up today!',
  'I can pick up this weekend',
  'Left on curb — thanks!',
  'Behind the gate on the left',
  'Text me when you arrive',
];

// ─── Conversation Row ─────────────────────────────────────────────────────────

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      style={styles.convRow}
      activeOpacity={0.85}
    >
      <View style={styles.thumbContainer}>
        {conversation.item?.images[0] ? (
          <Image
            source={{ uri: conversation.item.images[0] }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Text style={styles.thumbEmoji}>📦</Text>
          </View>
        )}
      </View>

      <View style={styles.convContent}>
        <View style={styles.convHeader}>
          <Text style={[styles.convItemTitle, hasUnread && styles.bold]} numberOfLines={1}>
            {conversation.item?.title ?? 'Item'}
          </Text>
          <Text style={styles.convTime}>
            {conversation.lastMessage
              ? formatTimeAgo(conversation.lastMessage.createdAt)
              : ''}
          </Text>
        </View>
        <View style={styles.convMeta}>
          <Avatar user={conversation.otherUser} size={18} />
          <Text
            style={[styles.convMessage, hasUnread && styles.unreadMessage]}
            numberOfLines={1}
          >
            {conversation.lastMessage?.text ?? 'Start a conversation'}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const { user } = useAuth();
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={styles.authPrompt} edges={['top']}>
        <StatusBar style="dark" />
        <Text style={styles.authEmoji}>💬</Text>
        <Text style={styles.authTitle}>Messages</Text>
        <Text style={styles.authSub}>
          Sign in to message people about items and coordinate pickups.
        </Text>
        <TouchableOpacity
          style={styles.authBtn}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.authBtnText}>Sign in to message</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.title}>Messages</Text>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.quickReplyBanner}
        onPress={() => setShowQuickReplies(!showQuickReplies)}
        activeOpacity={0.85}
      >
        <Text style={styles.quickReplyTitle}>⚡ Quick Replies</Text>
        <Text style={styles.quickReplyCaret}>{showQuickReplies ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showQuickReplies && (
        <View style={styles.quickReplies}>
          {QUICK_REPLIES.map((reply) => (
            <TouchableOpacity key={reply} style={styles.quickReplyChip}>
              <Text style={styles.quickReplyText}>"{reply}"</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <ConversationRow conversation={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>
              Express interest in an item to start a conversation.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.black,
    color: Colors.text,
    letterSpacing: -0.5,
    paddingTop: Spacing.sm,
  },
  quickReplyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  quickReplyTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  quickReplyCaret: { color: Colors.primary, fontSize: FontSize.xs },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.primaryMuted,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickReplyChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickReplyText: { fontSize: FontSize.xs, color: Colors.text },
  list: { paddingBottom: 100 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
  },
  thumbContainer: {},
  thumb: { width: 52, height: 52, borderRadius: Radius.md },
  thumbFallback: {
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 24 },
  convContent: { flex: 1 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convItemTitle: { flex: 1, fontSize: FontSize.base, color: Colors.text, marginRight: Spacing.sm },
  convTime: { fontSize: FontSize.xs, color: Colors.textTertiary },
  convMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  convMessage: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  unreadMessage: { color: Colors.text, fontWeight: '600' },
  bold: { fontWeight: FontWeight.bold },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadCount: { color: Colors.textInverse, fontSize: FontSize.xs, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.base },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  emptySub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  authPrompt: {
    flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'],
  },
  authEmoji: { fontSize: 64, marginBottom: Spacing.base },
  authTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.black, color: Colors.text, marginBottom: Spacing.sm },
  authSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  authBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full },
  authBtnText: { color: Colors.textInverse, fontSize: FontSize.base, fontWeight: '700' },
});
