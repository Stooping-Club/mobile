import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCartStore } from '@/store/cart';

const TAB_CONFIG: Record<string, { label: string; icon: string }> = {
  index: { label: 'Home', icon: '🏠' },
  search: { label: 'Search', icon: '🔍' },
  cart: { label: 'Cart', icon: '🛒' },
};

const TIMING_CONFIG = { duration: 150 };

type TabLayout = { x: number; width: number };

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const totalQuantity = useCartStore((s) => s.cart?.totalQuantity ?? 0);

  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayout>>({});

  const onTabLayout = useCallback((index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => ({ ...prev, [index]: { x, width } }));
  }, []);

  const activeLayout = tabLayouts[state.index];

  const sliderStyle = useAnimatedStyle(() => {
    if (!activeLayout) return { opacity: 0 };
    return {
      opacity: 1,
      transform: [{ translateX: withTiming(activeLayout.x, TIMING_CONFIG) }],
      width: withTiming(activeLayout.width, TIMING_CONFIG),
    };
  }, [activeLayout]);

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <View style={styles.pill} className="bg-white dark:bg-neutral-900">
        <Animated.View
          style={[
            styles.slider,
            { backgroundColor: isDark ? '#fff' : '#000' },
            sliderStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] ?? { label: route.name, icon: '●' };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLayout={(e) => onTabLayout(index, e)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              style={styles.tab}
            >
              <View style={styles.tabContent}>
                <Text style={{ fontSize: 16 }}>{config.icon}</Text>
                {isFocused && (
                  <Animated.Text
                    entering={FadeIn.duration(100).delay(50)}
                    exiting={FadeOut.duration(100)}
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: isDark ? '#000' : '#fff',
                    }}
                  >
                    {config.label}
                  </Animated.Text>
                )}
                {route.name === 'cart' && totalQuantity > 0 && !isFocused && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(100)}
                    className="absolute -right-1 -top-1 min-w-[18px] items-center rounded-full bg-black px-1 py-0.5 dark:bg-white"
                  >
                    <Text className="text-[10px] font-bold text-white dark:text-black">
                      {totalQuantity}
                    </Text>
                  </Animated.View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginHorizontal: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  slider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 999,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="cart" />
    </Tabs>
  );
}
