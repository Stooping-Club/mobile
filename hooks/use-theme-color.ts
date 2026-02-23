/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-themes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Shim: expose light/dark as keyed groups for components that still use the old pattern.
const LegacyColors = {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.primary,
    icon: Colors.textSecondary,
    tabIconDefault: Colors.tabIconDefault,
    tabIconSelected: Colors.tabIconSelected,
  },
  dark: {
    text: Colors.dark.text,
    background: Colors.dark.background,
    tint: Colors.primary,
    icon: Colors.dark.textSecondary,
    tabIconDefault: Colors.tabIconDefault,
    tabIconSelected: Colors.tabIconSelected,
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof LegacyColors.light
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return LegacyColors[theme][colorName];
  }
}
