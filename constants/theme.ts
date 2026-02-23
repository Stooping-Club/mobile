import { Platform } from 'react-native';

// ─── Color Palette ────────────────────────────────────────────────────────────

export const Palette = {
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',
  green800: '#166534',

  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber100: '#FEF3C7',

  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red500: '#EF4444',

  white: '#FFFFFF',
  black: '#000000',
};

export const Colors = {
  // Brand
  primary: Palette.green600,
  primaryDark: Palette.green700,
  primaryLight: Palette.green100,
  primaryMuted: Palette.green50,

  // Accent (Berkeley gold)
  accent: Palette.amber500,
  accentLight: Palette.amber100,

  // Surfaces
  background: Palette.slate50,
  surface: Palette.white,
  surfaceElevated: Palette.white,
  surfaceMuted: Palette.slate100,

  // Text
  text: Palette.slate900,
  textSecondary: Palette.slate500,
  textTertiary: Palette.slate400,
  textInverse: Palette.white,
  textLink: Palette.green600,

  // Borders
  border: Palette.slate200,
  borderFocus: Palette.green600,
  borderStrong: Palette.slate300,

  // Status
  statusAvailable: Palette.green600,
  statusPending: Palette.amber500,
  statusClaimed: Palette.slate400,

  // Semantic
  error: Palette.red500,
  errorLight: Palette.red100,
  errorBg: Palette.red50,
  success: Palette.green600,
  successLight: Palette.green100,
  warning: Palette.amber500,
  warningLight: Palette.amber100,

  // Overlays
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',
  overlayDark: 'rgba(0,0,0,0.75)',

  // Tab bar
  tabBarBackground: Palette.white,
  tabBarBorder: Palette.slate200,
  tabIconDefault: Palette.slate400,
  tabIconSelected: Palette.green600,

  // Dark mode
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceMuted: '#334155',
    border: '#334155',
    tabBarBackground: '#1E293B',
  },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FontSize = {
  '2xs': 10,
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const LineHeight = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const Shadow = {
  none: {},
  xs: {
    shadowColor: Palette.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: Palette.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Palette.slate900,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Palette.slate900,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: Palette.slate900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});
