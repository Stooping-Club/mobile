/**
 * Berkeley Stooping / Stooping Club brand theme
 * Colors sourced directly from berkeleystooping.org CSS
 */

export const Palette = {
  // Greens
  green:        '#589948',   // rgb(88,153,72)   — primary brand green
  greenDark:    '#2F5D3A',   // rgb(47,93,58)     — dark green
  greenDeep:    '#157500',   // rgb(21,117,0)     — deepest green
  greenLight:   '#6FAF6A',   // rgb(111,175,106)  — light green

  // Accent
  gold:         '#FDC656',   // rgb(253,198,86)   — yellow/gold accent

  // Backgrounds
  cream:        '#FAF9F1',   // rgb(250,249,241)  — main background
  creamDark:    '#F1EDE7',   // rgb(241,237,231)  — card / section bg

  // Grays
  gray100:      '#F5F5F5',
  gray200:      '#E6E6E6',   // rgb(230,230,230)
  gray300:      '#DEDEDE',   // rgb(222,222,222)
  gray600:      '#757575',
  gray800:      '#1A1A1A',   // rgb(26,26,26)
  black:        '#181818',   // rgb(24,24,24)
  white:        '#FFFFFF',
};

export const Colors = {
  light: {
    text:             Palette.black,
    textSecondary:    Palette.gray600,
    background:       Palette.cream,
    card:             Palette.white,
    cardAlt:          Palette.creamDark,
    tint:             Palette.green,
    tintDark:         Palette.greenDark,
    accent:           Palette.gold,
    border:           Palette.gray200,
    borderLight:      Palette.gray100,
    icon:             Palette.gray600,
    tabIconDefault:   Palette.gray600,
    tabIconSelected:  Palette.green,
    tag:              Palette.creamDark,
    tagText:          Palette.greenDark,
    headerBg:         Palette.white,
  },
  dark: {
    text:             '#F0EDE6',
    textSecondary:    '#9A9A8A',
    background:       '#16180F',
    card:             '#1E2016',
    cardAlt:          '#252718',
    tint:             Palette.greenLight,
    tintDark:         Palette.green,
    accent:           Palette.gold,
    border:           '#2E3020',
    borderLight:      '#252718',
    icon:             '#9A9A8A',
    tabIconDefault:   '#6A6A5A',
    tabIconSelected:  Palette.greenLight,
    tag:              '#252718',
    tagText:          Palette.greenLight,
    headerBg:         '#1E2016',
  },
};

// Font families — loaded via expo-font in _layout.tsx
export const Fonts = {
  serif:      'LibreBaskerville_400Regular',
  serifBold:  'LibreBaskerville_700Bold',
  sans:       'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold:   'Inter_700Bold',
};
