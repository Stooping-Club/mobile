import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Item } from '@/types';
import { Colors, Shadow, Spacing, Radius, FontSize } from '@/constants/theme';
import { getCategoryDef } from '@/constants/categories';
import { MapItemCard } from '@/components/items/item-card';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 120;

// ─── Map Region ───────────────────────────────────────────────────────────────

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface StoopingMapProps {
  items: Item[];
  userLatitude: number;
  userLongitude: number;
  style?: any;
}

// ─── Custom Pin ───────────────────────────────────────────────────────────────

const ItemPin = React.memo(function ItemPin({
  item,
  isSelected,
}: {
  item: Item;
  isSelected: boolean;
}) {
  const category = getCategoryDef(item.category);
  const isInactive = item.status !== 'available';

  return (
    <View style={styles.pinContainer}>
      <View
        style={[
          styles.pin,
          isSelected && styles.pinSelected,
          isInactive && styles.pinInactive,
          { borderColor: isSelected ? Colors.primary : category.color },
        ]}
      >
        <Text style={styles.pinEmoji}>{category.emoji}</Text>
      </View>
      <View
        style={[
          styles.pinTail,
          { backgroundColor: isSelected ? Colors.primary : category.color },
          isInactive && styles.pinTailInactive,
        ]}
      />
    </View>
  );
});

// ─── Main Map ─────────────────────────────────────────────────────────────────

export function StoopingMap({
  items,
  userLatitude,
  userLongitude,
  style,
}: StoopingMapProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  const showCard = useCallback((item: Item) => {
    setSelectedItem(item);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [cardAnim]);

  const hideCard = useCallback(() => {
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setSelectedItem(null));
  }, [cardAnim]);

  const handleMarkerPress = useCallback(
    (item: Item) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (selectedItem?.id === item.id) {
        hideCard();
      } else {
        showCard(item);
        // Animate map to center on pin
        mapRef.current?.animateToRegion(
          {
            latitude: item.latitude - 0.005,
            longitude: item.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          },
          400
        );
      }
    },
    [selectedItem, showCard, hideCard]
  );

  const handleMapPress = useCallback(() => {
    if (selectedItem) hideCard();
  }, [selectedItem, hideCard]);

  const handleCardPress = useCallback(() => {
    if (selectedItem) {
      router.push(`/item/${selectedItem.id}`);
    }
  }, [selectedItem]);

  const initialRegion: Region = {
    latitude: userLatitude,
    longitude: userLongitude,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {items.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            onPress={() => handleMarkerPress(item)}
            tracksViewChanges={false}
          >
            <ItemPin item={item} isSelected={selectedItem?.id === item.id} />
          </Marker>
        ))}
      </MapView>

      {/* My location button */}
      <TouchableOpacity
        style={styles.myLocationBtn}
        onPress={() => {
          mapRef.current?.animateToRegion(
            {
              latitude: userLatitude,
              longitude: userLongitude,
              latitudeDelta: 0.025,
              longitudeDelta: 0.025,
            },
            500
          );
        }}
      >
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>

      {/* Item count bubble */}
      <View style={styles.countBubble}>
        <Text style={styles.countText}>{items.length} items nearby</Text>
      </View>

      {/* Selected item card */}
      {selectedItem && (
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [CARD_HEIGHT + 40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MapItemCard item={selectedItem} onPress={handleCardPress} />
          <TouchableOpacity style={styles.closeBtn} onPress={hideCard}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Pins
  pinContainer: {
    alignItems: 'center',
  },
  pin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  pinSelected: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: Colors.primary,
    transform: [{ scale: 1.1 }],
    ...Shadow.lg,
  },
  pinInactive: {
    opacity: 0.5,
  },
  pinEmoji: { fontSize: 20 },
  pinTail: {
    width: 3,
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  pinTailInactive: {
    opacity: 0.5,
  },

  // My location button
  myLocationBtn: {
    position: 'absolute',
    right: Spacing.base,
    bottom: CARD_HEIGHT + 60,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  myLocationIcon: { fontSize: 20 },

  // Item count bubble
  countBubble: {
    position: 'absolute',
    top: Spacing.base,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  countText: {
    color: Colors.textInverse,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Selected card
  cardWrapper: {
    position: 'absolute',
    bottom: Spacing.xl + 20,
    left: Spacing.base,
    right: Spacing.base,
  },
  closeBtn: {
    position: 'absolute',
    top: -12,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  closeBtnText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
});
