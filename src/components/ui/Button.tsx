/**
 * src/components/ui/Button.tsx
 *
 * The single Button primitive for the entire app.
 * All interactive CTA surfaces render through this component.
 */

import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII, ANIMATION } from '@constants/design';

// ── Types ─────────────────────────────────────────────────────────────

export type ButtonVariant = 'gold' | 'ghost' | 'danger' | 'text';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  fullWidth?: boolean;
  style?:    ViewStyle;
  textStyle?: TextStyle;
}

// ── Component ────────────────────────────────────────────────────────

export function Button({
  children,
  variant   = 'gold',
  size      = 'md',
  loading   = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  onPress,
  ...rest
}: ButtonProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.timing(scale, { toValue: 0.97, duration: ANIMATION.duration.instant, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.timing(scale, { toValue: 1, duration: ANIMATION.duration.fast, useNativeDriver: true }).start();

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={{ transform: [{ scale }], width: fullWidth ? '100%' : undefined }}>
      <Pressable
        {...rest}
        onPress={isDisabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          styles[`size_${size}`],
          styles[`variant_${variant}`],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'gold' ? COLORS.textInverse : COLORS.goldBright}
            size="small"
          />
        ) : (
          <Text
            style={[
              styles.text,
              styles[`text_${size}`],
              styles[`text_${variant}`],
              textStyle,
            ]}
            numberOfLines={1}
          >
            {children}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    borderRadius:    RADII.full,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
  },
  fullWidth: { width: '100%' },
  disabled:  { opacity: 0.4 },

  // Sizes
  size_sm: { paddingHorizontal: SPACING['4'], paddingVertical: SPACING['2'] },
  size_md: { paddingHorizontal: SPACING['6'], paddingVertical: SPACING['3'] },
  size_lg: { paddingHorizontal: SPACING['8'], paddingVertical: SPACING['4'] },

  // Variants
  variant_gold: {
    backgroundColor: COLORS.gold,
    borderWidth:     0,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderWidth:     1,
    borderColor:     COLORS.goldSubtle,
  },
  variant_danger: {
    backgroundColor: 'transparent',
    borderWidth:     1,
    borderColor:     COLORS.error,
  },
  variant_text: {
    backgroundColor: 'transparent',
    borderWidth:     0,
    paddingHorizontal: SPACING['2'],
  },

  // Text base
  text: {
    fontFamily: TYPOGRAPHY.family.sans,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  text_sm:     { fontSize: TYPOGRAPHY.size.xs },
  text_md:     { fontSize: TYPOGRAPHY.size.sm },
  text_lg:     { fontSize: TYPOGRAPHY.size.base },
  text_gold:   { color: COLORS.textInverse },
  text_ghost:  { color: COLORS.goldBright },
  text_danger: { color: COLORS.error },
  text_text:   { color: COLORS.goldBright },
});
