/**
 * src/components/layout/SuccessOverlay.tsx
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII, Z } from '@constants/design';
import { Button } from '@components/ui/Button';
import { useUIStore } from '@store/ui.store';

const fmt = (n: number) => 'AED ' + Math.round(n).toLocaleString('en-US');

export function SuccessOverlay() {
  const { successInfo, clearSuccess } = useUIStore();
  const scale  = useRef(new Animated.Value(0.85)).current;
  const glow   = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!successInfo) return;

    scale.setValue(0.85);
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1100, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 1100, useNativeDriver: false }),
      ])
    );
    loopRef.current.start();

    return () => loopRef.current?.stop();
  }, [successInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!successInfo) return null;

  const shadowOpacity = glow.interpolate({
    inputRange:  [0, 1],
    outputRange: [0.15, 0.5],
  });

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={clearSuccess} />
      <Animated.View style={[styles.glowWrap, { shadowOpacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.emoji}>💸</Text>
          <Text style={styles.headline}>Cha-Ching!</Text>
          <Text style={styles.sub}>Order Confirmed</Text>
          <Text style={styles.amountLabel}>
            You just "paid"{' '}
            <Text style={styles.amount}>{fmt(successInfo.amount)}</Text>
          </Text>
          {successInfo.cardSaved && (
            <Text style={styles.savedCard}>💳 Card saved for next time</Text>
          )}
          <Text style={styles.footnote}>
            Nothing was charged. Nothing was shipped. Everything was felt.
          </Text>
          <Button fullWidth size="lg" onPress={clearSuccess} style={styles.btn}>
            Back to Flexing
          </Button>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex:          Z.overlay,
    elevation:       Z.overlay,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  glowWrap: {
    marginHorizontal: SPACING['6'],
    borderRadius:     RADII['3xl'],
    shadowColor:      COLORS.gold,
    shadowRadius:     30,
    shadowOffset:     { width: 0, height: 0 },
    width:            '100%',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADII['3xl'],
    borderWidth:     1,
    borderColor:     COLORS.goldSubtle,
    paddingVertical: SPACING['10'],
    paddingHorizontal: SPACING['6'],
    alignItems:      'center',
  },
  emoji:     { fontSize: 52, marginBottom: SPACING['2'] },
  headline:  { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size['4xl'], fontWeight: TYPOGRAPHY.weight.extrabold, letterSpacing: 0.5 },
  sub:       { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, letterSpacing: 2, marginTop: SPACING['1'], marginBottom: SPACING['3'] },
  amountLabel:{ color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.base, textAlign: 'center' },
  amount:    { color: COLORS.goldBright, fontWeight: TYPOGRAPHY.weight.bold },
  savedCard: { color: COLORS.success, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginTop: SPACING['3'] },
  footnote:  { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, textAlign: 'center', marginTop: SPACING['2'], marginBottom: SPACING['5'], lineHeight: TYPOGRAPHY.size.xs * 1.6 },
  btn:       {},
});
