/**
 * src/screens/CartScreen.tsx
 * TODO: full implementation — cart line items, summary, proceed to checkout
 */

import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { Button } from '@components/ui/Button';
import { useCart } from '@hooks/useCart';
import type { CartStackParamList } from '@types';

const fmt = (n: number) => 'AED ' + Math.round(n).toLocaleString('en-US');

type Props = NativeStackScreenProps<CartStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { lines, totalItems, subtotal, increment, decrement, remove } = useCart();

  if (lines.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Add something gold and unnecessary.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={lines}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.line}>
            <View style={styles.lineIcon}>
              <Text style={{ fontSize: 22 }}>{item.icon ?? '📦'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lineName}>{item.name}</Text>
              {!!item.variantLabel && (
                <Text style={styles.lineVariant}>{item.variantLabel}</Text>
              )}
              <Text style={styles.lineMeta}>{fmt(item.price)} × {item.qty}</Text>
            </View>

            {/* Stepper */}
            <View style={styles.stepper}>
              <Pressable hitSlop={8} onPress={() => decrement(item.id)} style={styles.stepBtn}>
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Text style={styles.stepQty}>{item.qty}</Text>
              <Pressable hitSlop={8} onPress={() => increment(item.id)} style={styles.stepBtn}>
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal ({totalItems} items)</Text>
              <Text style={styles.subtotalValue}>{fmt(subtotal)}</Text>
            </View>
            <Button
              fullWidth
              size="lg"
              onPress={() => navigation.navigate('Checkout')}
              style={{ marginTop: SPACING['4'] }}
            >
              Proceed to Checkout
            </Button>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: COLORS.background },
  list:  { padding: SPACING['5'], gap: SPACING['3'] },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING['3'] },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.xl,  fontWeight: TYPOGRAPHY.weight.bold },
  emptySub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm },

  line: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING['3'],
    backgroundColor: COLORS.surface, borderRadius: RADII.xl,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING['3'],
  },
  lineIcon: {
    width: 44, height: 44, borderRadius: RADII.lg,
    backgroundColor: COLORS.surfaceRaised, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  lineName:    { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  lineVariant: { color: COLORS.goldSubtle,    fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },
  lineMeta:    { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },

  stepper:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gold, borderRadius: RADII.full, overflow: 'hidden' },
  stepBtn:  { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: COLORS.textInverse, fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, lineHeight: TYPOGRAPHY.size.lg },
  stepQty:  { color: COLORS.textInverse, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.extrabold, minWidth: 20, textAlign: 'center' },

  footer: { marginTop: SPACING['4'], padding: SPACING['4'], backgroundColor: COLORS.surface, borderRadius: RADII.xl, borderWidth: 1, borderColor: COLORS.border },
  subtotalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotalLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm },
  subtotalValue: { color: COLORS.goldBright,    fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, fontFamily: TYPOGRAPHY.family.mono },
});
