/**
 * src/components/product/ProductCard.tsx
 */

import React, { useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII, ANIMATION } from '@constants/design';
import { Button } from '@components/ui/Button';
import type { IProduct } from '@types';

interface Props {
  product:      IProduct;
  qty:          number;
  onIncrement:  (product: IProduct) => void;
  onDecrement:  (product: IProduct) => void;
  onOpenDetail: (product: IProduct) => void;
}

export function ProductCard({ product, qty, onIncrement, onDecrement, onOpenDetail }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: ANIMATION.duration.instant, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: ANIMATION.duration.fast,    useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.card}>
      {/* Tappable area → detail screen */}
      <Pressable onPress={() => onOpenDetail(product)}>
        <View style={styles.imageWrap}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.emoji}>{product.icon ?? '📦'}</Text>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.category}>{product.cat.toUpperCase()}</Text>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.tagline} numberOfLines={2}>{product.tagline}</Text>
        </View>
      </Pressable>

      {/* Cart controls */}
      <View style={styles.footer}>
        <Text style={styles.price}>AED {Math.round(product.price).toLocaleString('en-US')}</Text>

        <Animated.View style={{ transform: [{ scale }] }}>
          {qty > 0 ? (
            <View style={styles.stepper}>
              <Pressable
                hitSlop={8}
                style={styles.stepBtn}
                onPress={() => { bounce(); onDecrement(product); }}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </Pressable>
              <Text style={styles.stepQty}>{qty}</Text>
              <Pressable
                hitSlop={8}
                style={styles.stepBtn}
                onPress={() => { bounce(); onIncrement(product); }}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
          ) : (
            <Button
              size="sm"
              onPress={() => { bounce(); onIncrement(product); }}
            >
              Add
            </Button>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADII.xl,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
    flex:            1,
  },

  imageWrap: {
    height:          110,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
  },
  image: { width: '100%', height: '100%' },
  emoji: { fontSize: 44 },

  badge: {
    position:        'absolute',
    top:             SPACING['2'],
    left:            SPACING['2'],
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth:     1,
    borderColor:     COLORS.goldSubtle,
    borderRadius:    RADII.full,
    paddingHorizontal: SPACING['2'],
    paddingVertical:   2,
  },
  badgeText: {
    color:        COLORS.goldBright,
    fontSize:     TYPOGRAPHY.size['2xs'],
    letterSpacing: 0.4,
    fontWeight:   TYPOGRAPHY.weight.semibold,
  },

  body: { padding: SPACING['3'], paddingBottom: 0 },

  category: {
    color:        COLORS.textSecondary,
    fontSize:     TYPOGRAPHY.size['2xs'],
    letterSpacing: 1.5,
    fontWeight:   TYPOGRAPHY.weight.semibold,
    marginBottom:  2,
  },
  name: {
    color:        COLORS.textPrimary,
    fontSize:     TYPOGRAPHY.size.base,
    fontWeight:   TYPOGRAPHY.weight.bold,
    lineHeight:   TYPOGRAPHY.size.base * TYPOGRAPHY.leading.snug,
    marginBottom: SPACING['1'],
  },
  tagline: {
    color:      COLORS.textSecondary,
    fontSize:   TYPOGRAPHY.size.xs,
    lineHeight: TYPOGRAPHY.size.xs * TYPOGRAPHY.leading.relaxed,
  },

  footer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        SPACING['3'],
  },
  price: {
    color:      COLORS.goldBright,
    fontSize:   TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    fontFamily: TYPOGRAPHY.family.mono,
  },

  stepper: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: COLORS.gold,
    borderRadius:   RADII.full,
    overflow:       'hidden',
  },
  stepBtn: {
    width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: {
    color: COLORS.textInverse, fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold,
    lineHeight: TYPOGRAPHY.size.lg,
  },
  stepQty: {
    color: COLORS.textInverse, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.extrabold,
    minWidth: 18, textAlign: 'center',
  },
});
