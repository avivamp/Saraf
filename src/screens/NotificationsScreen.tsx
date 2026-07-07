/**
 * src/screens/NotificationsScreen.tsx
 */

import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { Button } from '@components/ui/Button';
import { useNotifications } from '@hooks/useNotifications';
import { ProductsService } from '@services/products.service';
import { navigationRef } from '@navigation/navigationRef';
import { useUIStore } from '@store/ui.store';
import type { INotification, ProductCategory, ProfileStackParamList } from '@types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

// ── Type metadata ─────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = {
  general:  '📢',
  product:  '🛍️',
  category: '🏷️',
  order:    '✅',
};

const TYPE_LABEL: Record<string, string> = {
  general:  'Announcement',
  product:  'Product',
  category: 'Category',
  order:    'Order',
};

// ── Deep-link handler ────────────────────────────────────────────────────

async function handleDeepLink(notification: INotification): Promise<void> {
  const { type, payload } = notification;
  if (!navigationRef.isReady()) return;

  switch (type) {
    case 'product': {
      if (!payload.product_id) return;
      try {
        const product = await ProductsService.fetchById(payload.product_id);
        // Navigate to CatalogTab → ItemDetail
        navigationRef.navigate('CatalogTab');
        // Small delay to let the tab mount before pushing the stack
        setTimeout(() => {
          (navigationRef as any).navigate('ItemDetail', { product });
        }, 300);
      } catch { /* product no longer exists — just open catalogue */ }
      break;
    }
    case 'category': {
      if (!payload.category) return;
      // Set the active category filter then switch to catalogue
      useUIStore.getState().setActiveCategory(payload.category as ProductCategory | 'All');
      navigationRef.navigate('CatalogTab');
      break;
    }
    case 'order': {
      // ProfileTab → Orders
      navigationRef.navigate('ProfileTab');
      setTimeout(() => {
        (navigationRef as any).navigate('Orders');
      }, 300);
      break;
    }
    default:
      // general — no navigation, just reading is enough
      break;
  }
}

// ── Screen ───────────────────────────────────────────────────────────────

export function NotificationsScreen({ navigation }: Props) {
  const {
    notifications,
    isLoading,
    refetch,
    markRead,
    markAllRead,
  } = useNotifications();

  const handlePress = useCallback(async (item: INotification) => {
    if (!item.is_read) markRead(item.id);
    await handleDeepLink(item);
  }, [markRead]);

  if (isLoading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateEmoji}>🔔</Text>
        <Text style={styles.stateTitle}>No notifications yet</Text>
        <Text style={styles.stateSub}>
          You'll be notified about new releases, flash sales, and your orders here.
        </Text>
      </View>
    );
  }

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={styles.root}>
      {unread > 0 && (
        <View style={styles.markAllRow}>
          <Text style={styles.unreadLabel}>{unread} unread</Text>
          <Pressable onPress={() => markAllRead()}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <NotificationRow item={item} onPress={() => handlePress(item)} />
        )}
      />
    </View>
  );
}

// ── Row component ─────────────────────────────────────────────────────────

function NotificationRow({ item, onPress }: { item: INotification; onPress: () => void }) {
  const isActionable = item.type !== 'general';
  const timeAgo = formatTimeAgo(item.sent_at);

  return (
    <Pressable
      style={[styles.row, !item.is_read && styles.rowUnread]}
      onPress={onPress}
    >
      {/* Unread dot */}
      <View style={styles.dotWrap}>
        {!item.is_read && <View style={styles.dot} />}
      </View>

      {/* Type icon */}
      <View style={[styles.iconWrap, !item.is_read && styles.iconWrapActive]}>
        <Text style={styles.icon}>{TYPE_ICON[item.type] ?? '📢'}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.typeLabel}>{TYPE_LABEL[item.type] ?? 'Info'}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        <Text style={[styles.title, !item.is_read && styles.titleUnread]}>
          {item.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        {isActionable && (
          <Text style={styles.tapHint}>Tap to view →</Text>
        )}
      </View>
    </Pressable>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0)  return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins  > 0)  return `${mins}m ago`;
  return 'just now';
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  state:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING['8'], gap: SPACING['3'] },
  stateEmoji: { fontSize: 48 },
  stateTitle: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, textAlign: 'center' },
  stateSub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm, textAlign: 'center', lineHeight: TYPOGRAPHY.size.sm * 1.6 },

  markAllRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING['5'], paddingVertical: SPACING['3'],
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  unreadLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs },
  markAllText: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.semibold },

  list: { paddingBottom: SPACING['10'] },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING['4'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING['3'],
  },
  rowUnread: { backgroundColor: 'rgba(212,176,94,0.04)' },

  dotWrap: { width: 8, paddingTop: SPACING['2'], alignItems: 'center' },
  dot:     { width: 7, height: 7, borderRadius: RADII.full, backgroundColor: COLORS.gold },

  iconWrap: {
    width: 42, height: 42, borderRadius: RADII.lg,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { borderColor: COLORS.goldSubtle, backgroundColor: 'rgba(212,176,94,0.10)' },
  icon: { fontSize: 20 },

  content:   { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING['1'] },
  typeLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size['2xs'], letterSpacing: 1, fontWeight: TYPOGRAPHY.weight.semibold },
  time:      { color: COLORS.textDisabled,  fontSize: TYPOGRAPHY.size['2xs'] },
  title:     { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 2 },
  titleUnread: { color: COLORS.textPrimary },
  body:      { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, lineHeight: TYPOGRAPHY.size.xs * 1.6 },
  tapHint:   { color: COLORS.goldSubtle, fontSize: TYPOGRAPHY.size['2xs'], marginTop: SPACING['1'], fontWeight: TYPOGRAPHY.weight.medium },
});
