import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
} from '@/constants/theme';
import { NEIGHBORHOODS } from '@/constants/neighborhoods';
import { useItems } from '@/store/items-context';
import { NeighborhoodId } from '@/types';

const { width, height } = Dimensions.get('window');

// ─── Slides ───────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'welcome',
    emoji: '🌿',
    title: 'Welcome to Stooping',
    subtitle:
      'Discover free furniture, books, plants, and more from your Berkeley neighbors.',
    bg: Colors.primaryMuted,
    accentColor: Colors.primary,
  },
  {
    id: 'neighborhood',
    emoji: '📍',
    title: 'Your Neighborhood',
    subtitle: 'Choose where you live to see the most relevant items near you.',
    bg: Colors.accentLight,
    accentColor: Colors.accent,
  },
  {
    id: 'impact',
    emoji: '🌍',
    title: 'Make an Impact',
    subtitle:
      'Every item reused keeps weight out of landfills. Join 400+ Berkeley neighbors making a difference.',
    bg: Colors.primaryMuted,
    accentColor: Colors.primary,
  },
  {
    id: 'ready',
    emoji: '🎉',
    title: "You're All Set!",
    subtitle: 'Start discovering free items, or post something you want to give away.',
    bg: Colors.primaryMuted,
    accentColor: Colors.primary,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodId>('all');
  const flatListRef = useRef<FlatList>(null);
  const { setSelectedNeighborhood: setGlobalNeighborhood } = useItems();

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1, animated: true });
      setCurrentSlide(currentSlide + 1);
    } else {
      // Complete onboarding
      setGlobalNeighborhood(selectedNeighborhood);
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.replace('/(tabs)');
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.skipRow} edges={['top']}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.id}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={[styles.slideTitle, { color: item.accentColor }]}>
              {item.title}
            </Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>

            {/* Neighborhood selector on slide 2 */}
            {item.id === 'neighborhood' && (
              <View style={styles.neighborhoodList}>
                {NEIGHBORHOODS.filter((n) => n.id !== 'all').map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    style={[
                      styles.neighborhoodChip,
                      selectedNeighborhood === n.id && styles.neighborhoodChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedNeighborhood(n.id as NeighborhoodId);
                    }}
                  >
                    <Text style={styles.neighborhoodEmoji}>{n.emoji}</Text>
                    <Text
                      style={[
                        styles.neighborhoodLabel,
                        selectedNeighborhood === n.id && styles.neighborhoodLabelActive,
                      ]}
                    >
                      {n.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Impact stats on slide 3 */}
            {item.id === 'impact' && (
              <View style={styles.statsGrid}>
                {[
                  { value: '1,847', label: 'Items shared' },
                  { value: '24,350 lbs', label: 'Kept from landfill' },
                  { value: '400+', label: 'Active neighbors' },
                ].map((stat) => (
                  <View key={stat.label} style={styles.statBox}>
                    <Text style={[styles.statValue, { color: item.accentColor }]}>
                      {stat.value}
                    </Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentSlide && [styles.dotActive, { backgroundColor: slide.accentColor }],
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <SafeAreaView style={styles.cta} edges={['bottom']}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: slide.accentColor }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>
            {currentSlide === SLIDES.length - 1 ? "Let's go! 🚀" : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipRow: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingRight: Spacing.base,
  },
  skipBtn: { padding: Spacing.sm },
  skipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 60,
    paddingBottom: 120,
    gap: Spacing.base,
  },
  slideEmoji: { fontSize: 80 },
  slideTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.black,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Neighborhood
  neighborhoodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  neighborhoodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  neighborhoodChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  neighborhoodEmoji: { fontSize: 14 },
  neighborhoodLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  neighborhoodLabelActive: { color: Colors.textInverse },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },

  // Dots
  dots: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: { width: 24 },

  // CTA
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
  },
  ctaBtn: {
    height: 54,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
