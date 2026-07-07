/**
 * src/screens/CatalogScreen.tsx
 */

import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { navigationRef } from '@navigation/navigationRef';

import { COLORS, TYPOGRAPHY, SPACING, RADII, Z } from '@constants/design';
import { TopBar }        from '@components/layout/TopBar';
import { ProductCard }   from '@components/product/ProductCard';
import { Button }        from '@components/ui/Button';

import { useProducts }      from '@hooks/useProducts';
import { useCart }          from '@hooks/useCart';
import { useNotifications } from '@hooks/useNotifications';
import { useCategories }    from '@hooks/useCategories';
import { useAppConfig }     from '@hooks/useAppConfig';
import { useLanguage }      from '@hooks/useLanguage';
import { useAuthStore, selectUser }  from '@store/auth.store';
import { useUIStore }    from '@store/ui.store';
import type { CatalogStackParamList } from '@types';

type Props = NativeStackScreenProps<CatalogStackParamList, 'Catalog'>;

const SCREEN_W = Dimensions.get('window').width;
const CARD_GAP = SPACING['3'];
const CARD_W   = (SCREEN_W - SPACING['5'] * 2 - CARD_GAP) / 2;

export function CatalogScreen({ navigation }: Props) {
  const { filteredProducts, isLoading, isError, error, refetch } = useProducts();
  const { addItem, increment, decrement, totalItems }             = useCart();
  const { lines }                                                 = useCart();
  const { unreadCount }                                           = useNotifications();
  const { activeCategories }                                      = useCategories();
  const config                                                    = useAppConfig();
  const { t, language }                                           = useLanguage();
  const [searchQuery, setSearchQuery]                             = React.useState('');
  const user                                                       = useAuthStore(selectUser);
  const { activeCategory, setActiveCategory, openAuth, pushToast } = useUIStore();
  const [refreshing, setRefreshing]                                = React.useState(false);
  const [cartShaking, setCartShaking]                              = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getQty = (productId: string) =>
    lines.filter((l) => l.productId === productId).reduce((n, l) => n + l.qty, 0);

  const handleIncrement = (product: Parameters<typeof addItem>[0]) => {
    addItem(product, {}, 1);
    setCartShaking(true);
    pushToast(`Added "${product.name}"`);
    setTimeout(() => setCartShaking(false), 600);
  };

  const handleDecrement = (product: Parameters<typeof addItem>[0]) => {
    const line = lines.find((l) => l.productId === product.id && !l.variantLabel);
    if (line) decrement(line.id);
  };

  const CategoryTabs = (
    <View style={styles.tabsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {['All', ...activeCategories.map((c) => c.name)].map((cat) => (
          <Pressable
            key={cat}
            onPress={() => { setActiveCategory(cat); setSearchQuery(''); }}
            style={[styles.tab, activeCategory === cat && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
              {cat === 'All'
                ? t('All', 'الكل')
                : `${activeCategories.find((c) => c.name === cat)?.icon ?? ''} ${cat}`.trim()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  // Apply search filter on top of category filter
  const displayProducts = searchQuery.trim().length > 1
    ? filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        cartCount={totalItems}
        user={user}
        appName={config.app_name}
        appTagline={t(config.app_tagline_en, config.app_tagline_ar)}
        logoUrl={config.app_logo_url || undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClose={() => setSearchQuery('')}
        onPressCart={() => navigation.getParent()?.navigate('CartTab')}
        onPressAccount={() => navigation.getParent()?.navigate('ProfileTab')}
        onPressBell={() => {
          navigation.getParent()?.navigate('ProfileTab');
          setTimeout(() => navigationRef.isReady() && (navigationRef as any).navigate('Notifications'), 300);
        }}
        unreadCount={unreadCount}
        cartShaking={cartShaking}
      />

      {isLoading ? (
        <>
          {CategoryTabs}
          <View style={styles.state}>
            <ActivityIndicator color={COLORS.gold} size="large" />
            <Text style={styles.stateText}>Loading catalogue…</Text>
          </View>
        </>
      ) : isError ? (
        <>
          {CategoryTabs}
          <View style={styles.state}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Button variant="ghost" onPress={() => refetch()} style={styles.retryBtn}>Retry</Button>
          </View>
        </>
      ) : (
        <FlatList
          data={displayProducts}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={CategoryTabs}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
          renderItem={({ item }) => (
            <View style={{ width: CARD_W }}>
              <ProductCard
                product={item}
                qty={getQty(item.id)}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onOpenDetail={(p) => navigation.navigate('ItemDetail', { product: p })}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.state}>
              <Text style={styles.stateEmoji}>{searchQuery ? '🔍' : '🪙'}</Text>
              <Text style={styles.stateText}>
                {searchQuery
                  ? t(`No results for "${searchQuery}"`, `لا توجد نتائج لـ "${searchQuery}"`)
                  : activeCategory === 'All'
                    ? t('No products yet.', 'لا توجد منتجات بعد.')
                    : t(`No items in "${activeCategory}"`, `لا توجد عناصر في "${activeCategory}"`)}
              </Text>
            </View>
          }
          ListFooterComponent={<Footer />}
        />
      )}
    </SafeAreaView>
  );
}

function Footer() {
  const [visitors, setVisitors] = React.useState<number | null>(null);
  React.useEffect(() => {
    import('@services/analytics.service')
      .then(({ AnalyticsService }) => AnalyticsService.incrementVisitors())
      .then(setVisitors)
      .catch(() => {});
  }, []);

  return (
    <View style={footer.wrap}>
      <Text style={footer.legal}>
        Saraf is a satirical shopping experience. No real payments or goods are involved.
      </Text>
      {visitors != null && (
        <View style={footer.visitorRow}>
          <View style={footer.dot} />
          <Text style={footer.visitorText}>{visitors.toLocaleString()} visits and counting</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  tabsWrapper:  {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING['2'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsContent: { paddingHorizontal: SPACING['5'], gap: SPACING['2'] },
  tab: {
    paddingHorizontal: SPACING['4'], paddingVertical: SPACING['2'],
    borderRadius: RADII.full, borderWidth: 1, borderColor: 'transparent',
  },
  tabActive: { backgroundColor: 'rgba(212,176,94,0.12)', borderColor: COLORS.goldSubtle },
  tabText:       { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  tabTextActive: { color: COLORS.goldBright },

  grid: { padding: SPACING['5'], paddingTop: SPACING['3'] },
  row:  { gap: CARD_GAP, marginBottom: CARD_GAP },

  state:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING['8'], gap: SPACING['3'] },
  stateEmoji: { fontSize: 36 },
  stateText:  { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm, textAlign: 'center' },
  retryBtn:   { marginTop: SPACING['2'] },
});

const footer = StyleSheet.create({
  wrap:        { paddingHorizontal: SPACING['5'], paddingBottom: SPACING['8'], marginTop: SPACING['4'], borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING['4'] },
  legal:       { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, lineHeight: TYPOGRAPHY.size.xs * 1.7 },
  visitorRow:  { flexDirection: 'row', alignItems: 'center', marginTop: SPACING['3'], gap: SPACING['2'] },
  dot:         { width: 6, height: 6, borderRadius: RADII.full, backgroundColor: COLORS.success },
  visitorText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.medium },
});
