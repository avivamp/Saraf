/**
 * src/components/layout/TopBar.tsx
 */

import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';

interface Props {
  cartCount:      number;
  user:           { email: string } | null;
  onPressCart:    () => void;
  onPressAccount: () => void;
  cartShaking?:   boolean;
}

export function TopBar({ cartCount, user, onPressCart, onPressAccount, cartShaking }: Props) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!cartShaking) return;
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1,  duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1,  duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 70, useNativeDriver: true }),
    ]).start();
  }, [cartShaking]); // eslint-disable-line react-hooks/exhaustive-deps

  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  const initial = user?.email.charAt(0).toUpperCase() ?? '';

  return (
    <View style={styles.bar}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.logoRing}>
          <Text style={styles.logoLetter}>S</Text>
        </View>
        <View>
          <Text style={styles.brandName}>Saraf</Text>
          <Text style={styles.brandSub}>LUXURY, DELIVERED</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {/* Account */}
        <Pressable style={styles.iconBtn} onPress={onPressAccount}>
          {user ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
          ) : (
            <Text style={styles.signIn}>Sign In</Text>
          )}
        </Pressable>

        {/* Cart */}
        <Pressable style={styles.iconBtn} onPress={onPressCart}>
          <Animated.Text style={[styles.cartIcon, { transform: [{ rotate }] }]}>
            🛍️
          </Animated.Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection:      'row',
    alignItems:         'center',
    justifyContent:     'space-between',
    paddingHorizontal:  SPACING['5'],
    paddingVertical:    SPACING['3'],
    borderBottomWidth:  1,
    borderBottomColor:  COLORS.border,
    backgroundColor:    COLORS.background,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: SPACING['2'] },
  logoRing: {
    width: 36, height: 36, borderRadius: RADII.full,
    borderWidth: 1, borderColor: COLORS.goldSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  brandName:  { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  brandSub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size['2xs'], letterSpacing: 1.5, marginTop: 1 },

  actions:    { flexDirection: 'row', alignItems: 'center', gap: SPACING['2'] },
  iconBtn:    { width: 42, height: 42, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  cartIcon:   { fontSize: 18 },
  signIn:     { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold },

  avatar: {
    width: 28, height: 28, borderRadius: RADII.full,
    backgroundColor: COLORS.goldTint, borderWidth: 1, borderColor: COLORS.goldSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.extrabold },

  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: COLORS.gold, borderRadius: RADII.full,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: COLORS.textInverse, fontSize: 10, fontWeight: TYPOGRAPHY.weight.extrabold },
});
