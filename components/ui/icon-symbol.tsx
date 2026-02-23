// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'arrow.left': 'arrow-back',
  'arrow.right': 'arrow-forward',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'ellipsis': 'more-horiz',
  'ellipsis.circle': 'more-horiz',

  // Browse
  'map': 'map',
  'map.fill': 'map',
  'list.bullet': 'format-list-bulleted',
  'magnifyingglass': 'search',
  'square.grid.2x2': 'grid-view',
  'location.fill': 'my-location',
  'location': 'location-on',

  // Messaging
  'bubble.left.and.bubble.right.fill': 'chat',
  'bubble.left.fill': 'chat-bubble',
  'bubble.left': 'chat-bubble-outline',

  // People
  'person.fill': 'person',
  'person': 'person-outline',
  'person.2.fill': 'people',
  'checkmark.seal.fill': 'verified',
  'shield.fill': 'verified-user',
  'shield': 'security',

  // Actions
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'camera.fill': 'camera-alt',
  'camera': 'camera-alt',
  'photo.fill': 'photo-library',
  'photo': 'photo-library',
  'photo.on.rectangle': 'add-photo-alternate',
  'square.and.arrow.up': 'share',
  'trash': 'delete',
  'trash.fill': 'delete',
  'pencil': 'edit',
  'arrow.clockwise': 'refresh',

  // Status / Feedback
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.circle': 'check-circle-outline',
  'star.fill': 'star',
  'star': 'star-border',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'eye.fill': 'visibility',
  'eye': 'visibility',
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.triangle': 'warning-amber',
  'info.circle': 'info-outline',
  'info.circle.fill': 'info',

  // Categories / Content
  'leaf.fill': 'eco',
  'leaf': 'eco',
  'tag.fill': 'local-offer',
  'tag': 'local-offer',
  'flame.fill': 'local-fire-department',
  'flame': 'local-fire-department',
  'sparkles': 'auto-awesome',
  'wand.and.stars': 'auto-fix-high',
  'newspaper.fill': 'article',
  'newspaper': 'article',

  // Notifications / Settings
  'bell.fill': 'notifications',
  'bell': 'notifications-none',
  'gear': 'settings',
  'gear.fill': 'settings',
  'lock.fill': 'lock',

  // Misc
  'sofa': 'weekend',
  'tshirt.fill': 'checkroom',
  'fork.knife': 'restaurant',
  'figure.run': 'directions-run',
  'paintpalette.fill': 'palette',
  'gamecontroller.fill': 'sports-esports',
  'book.fill': 'menu-book',
  'tv': 'tv',
  'car.fill': 'directions-car',
  'bicycle': 'pedal-bike',
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
