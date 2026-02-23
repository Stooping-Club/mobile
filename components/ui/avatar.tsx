import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius } from '@/constants/theme';
import { User } from '@/types';

interface AvatarProps {
  user?: Partial<User>;
  size?: number;
  showBadge?: boolean;
}

export function Avatar({ user, size = 40, showBadge = false }: AvatarProps) {
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <View style={{ width: size, height: size }}>
      {user?.avatar ? (
        <Image
          source={{ uri: user.avatar }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
            {initials}
          </Text>
        </View>
      )}
      {showBadge && user?.verified && (
        <View style={[styles.badge, { bottom: 0, right: 0 }]}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  fallback: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
  },
});
