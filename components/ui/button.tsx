import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  style,
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? Colors.textInverse : Colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              textVariantStyles[variant],
              textSizeStyles[size],
            ]}
          >
            {label}
          </Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: { marginRight: 6 },
  iconRight: { marginLeft: 6 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: { fontWeight: FontWeight.semibold },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.primaryLight },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.error },
});

const sizeStyles = StyleSheet.create({
  sm: { height: 36, paddingHorizontal: Spacing.md },
  md: { height: 46, paddingHorizontal: Spacing.lg },
  lg: { height: 54, paddingHorizontal: Spacing.xl },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: Colors.textInverse },
  secondary: { color: Colors.primary },
  outline: { color: Colors.primary },
  ghost: { color: Colors.primary },
  danger: { color: Colors.textInverse },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: FontSize.sm },
  md: { fontSize: FontSize.base },
  lg: { fontSize: FontSize.md },
});
