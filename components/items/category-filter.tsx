import React, { useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CATEGORIES } from '@/constants/categories';
import { useItems } from '@/store/items-context';
import { Colors, Radius, FontSize, Spacing } from '@/constants/theme';

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useItems();
  const scrollRef = useRef<ScrollView>(null);

  const handleSelect = (id: string) => {
    Haptics.selectionAsync();
    setSelectedCategory(id);
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => handleSelect(cat.id)}
            activeOpacity={0.8}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  emoji: { fontSize: 14 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  labelActive: {
    color: Colors.textInverse,
  },
});
