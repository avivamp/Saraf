/**
 * src/screens/OrdersScreen.tsx
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { Button } from '@components/ui/Button';
import { useOrders } from '@hooks/useOrders';
import type { IOrder } from '@types';

const fmt = (n: number) => 'AED ' + Math.round(n).toLocaleString('en-US');

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }) +
    '  ' +
    d.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })
  );
};

export function OrdersScreen() {
  const { orders, isLoading, isError, refetch } = useOrders();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (isLoading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={COLORS.gold} size="large" />
        <Text style={styles.stateText}>Loading your orders…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateEmoji}>⚠️</Text>
        <Text style={styles.stateText}>Couldn't load orders.</Text>
        <Button variant="ghost" size="sm" onPress={() => refetch()} style={styles.retryBtn}>Retry</Button>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateEmoji}>🛍️</Text>
        <Text style={styles.stateText}>No orders yet.</Text>
        <Text style={styles.stateSub}>Your order history will appear here once you've checked out.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <OrderCard order={item} expanded={!!expanded[item.id]} onToggle={() => toggle(item.id)} />
      )}
    />
  );
}

function OrderCard({ order, expanded, onToggle }: { order: IOrder; expanded: boolean; onToggle: () => void }) {
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    <View style={styles.card}>
      <Pressable style={styles.cardHeader} onPress={onToggle}>
        <View style={{ flex: 1 }}>
          <View style={styles.metaRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
          </View>
          <Text style={styles.total}>{fmt(order.total)}</Text>
          <Text style={styles.itemCount}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.itemsWrap}>
          {items.map((li) => (
            <View key={li.id} style={styles.lineItem}>
              <View style={styles.liIcon}>
                <Text style={{ fontSize: 18 }}>{li.product_icon ?? '📦'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.liName}>{li.product_name}</Text>
                {!!li.variant_label && <Text style={styles.liVariant}>{li.variant_label}</Text>}
                <Text style={styles.liMeta}>{fmt(li.unit_price)} × {li.quantity}</Text>
              </View>
              <Text style={styles.liTotal}>{fmt(li.line_total)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalValue}>{fmt(order.total)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING['5'], gap: SPACING['3'] },

  state:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING['3'], padding: SPACING['8'] },
  stateEmoji:{ fontSize: 40 },
  stateText: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, textAlign: 'center' },
  stateSub:  { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,   textAlign: 'center' },
  retryBtn:  {},

  card: { backgroundColor: COLORS.surface, borderRadius: RADII.xl, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },

  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING['4'] },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING['2'], marginBottom: SPACING['1'] },
  statusBadge:{ backgroundColor: `${COLORS.success}22`, borderWidth: 1, borderColor: COLORS.success, borderRadius: RADII.full, paddingHorizontal: SPACING['2'], paddingVertical: 2 },
  statusText: { color: COLORS.success, fontSize: TYPOGRAPHY.size['2xs'], fontWeight: TYPOGRAPHY.weight.bold, letterSpacing: 1 },
  dateText:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs },
  total:      { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size['2xl'], fontWeight: TYPOGRAPHY.weight.bold },
  itemCount:  { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },
  chevron:    { color: COLORS.textSecondary, fontSize: 11, marginLeft: SPACING['2'] },

  itemsWrap:  { borderTopWidth: 1, borderTopColor: COLORS.border, padding: SPACING['4'], gap: SPACING['3'] },
  lineItem:   { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING['3'] },
  liIcon:     { width: 36, height: 36, borderRadius: RADII.md, backgroundColor: COLORS.surfaceRaised, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  liName:     { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  liVariant:  { color: COLORS.goldSubtle,    fontSize: TYPOGRAPHY.size.xs, marginTop: 1 },
  liMeta:     { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, marginTop: 1 },
  liTotal:    { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold },

  divider:    { height: 1, backgroundColor: COLORS.border },
  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm },
  totalValue: { color: COLORS.goldBright,    fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
});
