import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ItemStatus } from '@/types';
import { Colors, Radius, FontSize } from '@/constants/theme';

interface StatusBadgeProps {
  status: ItemStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<ItemStatus, { label: string; emoji: string; bg: string; text: string }> = {
  available: { label: 'Available', emoji: '✅', bg: Colors.primaryLight, text: Colors.primary },
  pending: { label: 'Pending', emoji: '⏳', bg: Colors.accentLight, text: Colors.accent },
  claimed: { label: 'Claimed', emoji: '📦', bg: '#F1F5F9', text: Colors.textSecondary },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'sm' && styles.sm]}>
      <Text style={size === 'sm' ? styles.emojiSm : styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.text }, size === 'sm' && styles.labelSm]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  emoji: { fontSize: 12 },
  emojiSm: { fontSize: 10 },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: FontSize['2xs'],
  },
});
