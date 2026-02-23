import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors, Radius, FontSize, Spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
  onRightPress?: () => void;
}

export function Input({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  containerStyle,
  onRightPress,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        <TextInput
          {...props}
          style={[
            styles.input,
            leftElement ? styles.inputWithLeft : undefined,
            rightElement ? styles.inputWithRight : undefined,
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={Colors.textTertiary}
        />
        {rightElement && (
          <TouchableOpacity
            style={styles.rightElement}
            onPress={onRightPress}
            disabled={!onRightPress}
          >
            {rightElement}
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {!!hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

export function TextArea(props: InputProps) {
  return (
    <Input
      {...props}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      style={[{ minHeight: 100, paddingTop: Spacing.md }, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    minHeight: 48,
  },
  inputFocused: { borderColor: Colors.primary },
  inputError: { borderColor: Colors.error },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  inputWithLeft: { paddingLeft: 4 },
  inputWithRight: { paddingRight: 4 },
  leftElement: { paddingLeft: Spacing.base },
  rightElement: { paddingRight: Spacing.base },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginTop: 4 },
  hintText: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 4 },
});
