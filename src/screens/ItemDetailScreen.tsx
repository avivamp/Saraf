/**
 * src/screens/ItemDetailScreen.tsx
 */

import React, { useState, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { Button } from '@components/ui/Button';
import { useCart } from '@hooks/useCart';
import { useUIStore } from '@store/ui.store';
import type { CatalogStackParamList, SelectionMap, ProductImage } from '@types';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_H = 280;

const fmt = (n: number) => 'AED ' + Math.round(n).toLocaleString('en-US');

type Props = NativeStackScreenProps<CatalogStackParamList, 'ItemDetail'>;

// ── Image carousel ────────────────────────────────────────────

function ImageCarousel({ images, icon, badge }: {
  images: ProductImage[];
  icon:   string | null;
  badge:  string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(index);
  };

  // Fallback to emoji when no images
  if (images.length === 0) {
    return (
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{icon ?? '📦'}</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{badge}</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(img) => img.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.url }}
              style={styles.slideImage}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* Badge overlaid on image */}
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>{badge}</Text>
      </View>

      {/* Dot indicators — only shown when >1 image */}
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}

      {/* Image counter e.g. "2 / 4" */}
      {images.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>{activeIndex + 1} / {images.length}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────

export function ItemDetailScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const { addItem } = useCart();
  const { pushToast } = useUIStore();

  const initial: SelectionMap = {};
  (product.customizations ?? []).forEach((g) => {
    if (g.options[0]) initial[g.id] = g.options[0];
  });

  const [selections, setSelections] = useState<SelectionMap>(initial);
  const [quantity, setQuantity]     = useState(1);

  const deltaTotal = Object.values(selections).reduce((s, o) => s + (o.delta ?? 0), 0);
  const unitPrice  = product.price + deltaTotal;

  const handleAdd = () => {
    addItem(product, selections, quantity);
    pushToast(`Added "${product.name}"`);
    navigation.goBack();
  };

  // Build images list: use product.images if available, fall back to single image_url
  const images: ProductImage[] = product.images?.length
    ? product.images
    : product.image_url
      ? [{ id: 'primary', url: product.image_url, alt_text: product.name, sort_order: 0 }]
      : [];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Image carousel */}
        <ImageCarousel images={images} icon={product.icon} badge={product.badge} />

        <View style={styles.body}>
          <Text style={styles.cat}>{product.cat.toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.basePrice}>From {fmt(product.price)}</Text>
          <Text style={styles.description}>{product.description || product.tagline}</Text>

          {/* Customisation groups */}
          {(product.customizations ?? []).map((group) => (
            <View key={group.id} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.optionRow}>
                {group.options.map((opt) => {
                  const active = selections[group.id]?.id === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setSelections((p) => ({ ...p, [group.id]: opt }))}
                      style={[styles.option, active && styles.optionActive]}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {opt.label}
                      </Text>
                      {opt.delta > 0 && (
                        <Text style={[styles.optionDelta, active && styles.optionTextActive]}>
                          +{fmt(opt.delta)}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Quantity */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable hitSlop={8} onPress={() => setQuantity((q) => Math.max(1, q - 1))} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qty}>{quantity}</Text>
              <Pressable hitSlop={8} onPress={() => setQuantity((q) => q + 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerPrice}>{fmt(unitPrice * quantity)}</Text>
        </View>
        <Button size="lg" onPress={handleAdd} style={styles.addBtn}>
          Add to Cart
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 120 },

  // ── Carousel ───────────────────────────────────────────────
  hero: {
    height: HERO_H, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  slide: {
    width:            SCREEN_W,
    height:           HERO_H,
    backgroundColor:  COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    overflow:         'hidden',
  },
  slideImage:  { width: '100%', height: '100%' },
  heroEmoji:   { fontSize: 80 },
  heroBadge: {
    position: 'absolute', top: SPACING['3'], left: SPACING['3'],
    backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: COLORS.goldSubtle,
    borderRadius: RADII.full, paddingHorizontal: SPACING['3'], paddingVertical: SPACING['1'],
  },
  heroBadgeText: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size['2xs'], letterSpacing: 0.5, fontWeight: TYPOGRAPHY.weight.semibold },
  dots: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: SPACING['2'], gap: SPACING['1'],
    backgroundColor: COLORS.background,
  },
  dot: {
    width: 6, height: 6, borderRadius: RADII.full,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 18, backgroundColor: COLORS.gold,
  },
  counter: {
    position: 'absolute', bottom: SPACING['3'] + 18, right: SPACING['3'],
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: RADII.full,
    paddingHorizontal: SPACING['3'], paddingVertical: 3,
  },
  counterText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size['2xs'], fontWeight: TYPOGRAPHY.weight.semibold },

  body:        { padding: SPACING['5'] },
  cat:         { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size['2xs'], letterSpacing: 1.5, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING['1'] },
  name:        { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size['3xl'], fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['1'] },
  basePrice:   { color: COLORS.goldBright,    fontSize: TYPOGRAPHY.size.sm,     fontFamily: TYPOGRAPHY.family.mono, marginBottom: SPACING['3'] },
  description: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,     lineHeight: TYPOGRAPHY.size.sm * 1.65, marginBottom: SPACING['5'] },

  group:      { marginBottom: SPACING['5'] },
  groupLabel: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING['2'] },
  optionRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING['2'] },
  option:     { paddingHorizontal: SPACING['4'], paddingVertical: SPACING['2'], borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.border, gap: SPACING['1'] },
  optionActive:{ borderColor: COLORS.goldSubtle, backgroundColor: 'rgba(212,176,94,0.12)' },
  optionText:     { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.medium },
  optionTextActive:{ color: COLORS.goldBright },
  optionDelta:    { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size['2xs'] },

  qtyRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING['4'] },
  qtyBtn:     { width: 40, height: 40, borderRadius: RADII.full, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, lineHeight: TYPOGRAPHY.size.xl },
  qty:        { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, minWidth: 32, textAlign: 'center' },

  footer:      { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING['5'], backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs },
  footerPrice: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size['2xl'], fontWeight: TYPOGRAPHY.weight.bold, fontFamily: TYPOGRAPHY.family.mono },
  addBtn:      { flex: 1, marginLeft: SPACING['4'] },
});
