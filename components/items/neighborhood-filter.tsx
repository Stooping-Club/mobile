import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { NEIGHBORHOODS } from '@/constants/neighborhoods';
import { useItems } from '@/store/items-context';
import { Colors, Radius, FontSize, Spacing } from '@/constants/theme';
import { NeighborhoodId } from '@/types';

export function NeighborhoodFilter() {
  const { selectedNeighborhood, setSelectedNeighborhood } = useItems();

  const handleSelect = (id: NeighborhoodId) => {
    Haptics.selectionAsync();
    setSelectedNeighborhood(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {NEIGHBORHOODS.map((n) => {
        const isActive = selectedNeighborhood === n.id;
        return (
          <TouchableOpacity
            key={n.id}
            onPress={() => handleSelect(n.id as NeighborhoodId)}
            activeOpacity={0.8}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={styles.emoji}>{n.emoji}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {n.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  container: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  emoji: { fontSize: 13 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  labelActive: {
    color: Colors.textInverse,
  },
});
