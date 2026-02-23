import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── Pre-built Skeleton Layouts ───────────────────────────────────────────────

export function ItemCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton height={200} borderRadius={0} />
      <View style={skeletonStyles.body}>
        <Skeleton height={20} width="75%" />
        <Skeleton height={14} width="45%" style={{ marginTop: 6 }} />
        <View style={skeletonStyles.row}>
          <Skeleton height={26} width={70} borderRadius={Radius.full} />
          <Skeleton height={26} width={70} borderRadius={Radius.full} />
        </View>
      </View>
    </View>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <View style={skeletonStyles.profileHeader}>
      <Skeleton width={72} height={72} borderRadius={36} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} width="40%" />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  body: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
  },
});
