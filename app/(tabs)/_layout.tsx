import React from 'react';
import { Tabs, router } from 'expo-router';
import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ─── Post FAB ─────────────────────────────────────────────────────────────────

function PostFABButton() {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/new-item');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.fabOuter, pressed && styles.fabPressed]}
    >
      <View style={styles.fabInner}>
        <Text style={styles.fabPlus}>+</Text>
      </View>
    </Pressable>
  );
}

// ─── Tab Layout ───────────────────────────────────────────────────────────────

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? Colors.dark.tabBarBackground : Colors.tabBarBackground,
          borderTopColor: isDark ? Colors.dark.border : Colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...Shadow.sm,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 24}
              name="map.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: '',
          tabBarButton: () => <PostFABButton />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 24}
              name="bubble.left.and.bubble.right.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 24}
              name="person.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
    ...Shadow.lg,
  },
  fabPlus: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
    marginTop: -2,
  },
});
