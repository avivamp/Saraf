/**
 * src/components/layout/TopBar.tsx
 *
 * The search icon sits before the account icon. Tapping it slides the
 * brand area out and expands a text input across the full bar width.
 * Tapping ✕ collapses it back.
 */

import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII, ANIMATION } from '@constants/design';

interface Props {
  cartCount:      number;
  user:           { email: string } | null;
  onPressCart:    () => void;
  onPressAccount: () => void;
  onPressBell:    () => void;
  unreadCount?:   number;
  cartShaking?:   boolean;
  appName?:       string;
  appTagline?:    string;
  logoUrl?:       string;
  // Search — managed by parent so filtering lives in CatalogScreen
  searchQuery:        string;
  onSearchChange:     (text: string) => void;
  onSearchClose:      () => void;
}

export function TopBar({
  cartCount, user, onPressCart, onPressAccount, onPressBell,
  unreadCount = 0, cartShaking,
  appName = 'Saraf', appTagline = 'LUXURY, DELIVERED', logoUrl,
  searchQuery, onSearchChange, onSearchClose,
}: Props) {

  const [searchOpen, setSearchOpen] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const inputRef   = useRef<TextInput>(null);

  // Cart shake
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

  const openSearch = () => {
    setSearchOpen(true);
    Animated.timing(searchAnim, {
      toValue:  1,
      duration: ANIMATION.duration.normal,
      useNativeDriver: false,
    }).start(() => inputRef.current?.focus());
  };

  const closeSearch = () => {
    onSearchChange('');
    onSearchClose();
    Animated.timing(searchAnim, {
      toValue:  0,
      duration: ANIMATION.duration.fast,
      useNativeDriver: false,
    }).start(() => setSearchOpen(false));
  };

  // Brand fades out as search slides in
  const brandOpacity = searchAnim.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' });
  const brandScale   = searchAnim.interpolate({ inputRange: [0, 1],   outputRange: [1, 0.8] });
  const inputOpacity = searchAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0, 1],   extrapolate: 'clamp' });
  const inputWidth   = searchAnim.interpolate({ inputRange: [0, 1],   outputRange: ['0%', '100%'] });

  const initial = user?.email.charAt(0).toUpperCase() ?? '';

  return (
    <View style={styles.bar}>

      {/* ── Brand (fades out when search opens) ── */}
      {!searchOpen && (
        <Animated.View style={[styles.brand, { opacity: brandOpacity, transform: [{ scale: brandScale }] }]}>
          <View style={styles.logoRing}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logoImg} resizeMode="contain" />
            ) : (
              <Text style={styles.logoLetter}>{appName.charAt(0)}</Text>
            )}
          </View>
          <View>
            <Text style={styles.brandName}>{appName}</Text>
            <Text style={styles.brandSub}>{appTagline}</Text>
          </View>
        </Animated.View>
      )}

      {/* ── Expanding search input ── */}
      {searchOpen && (
        <Animated.View style={[styles.searchWrap, { width: inputWidth, opacity: inputOpacity }]}>
          <Text style={styles.searchIconInline}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search products…"
            placeholderTextColor={COLORS.textDisabled}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Animated.View>
      )}

      {/* ── Action icons ── */}
      <View style={styles.actions}>

        {/* Search / Close toggle */}
        <Pressable style={styles.iconBtn} onPress={searchOpen ? closeSearch : openSearch}>
          <Text style={styles.searchIcon}>{searchOpen ? '✕' : '🔍'}</Text>
        </Pressable>

        {/* Account — icon only, no pill */}
        {!searchOpen && (
          <Pressable style={styles.iconBtn} onPress={onPressAccount}>
            {user ? (
              // Signed in: filled gold circle with initial
              <View style={styles.avatarFilled}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
            ) : (
              // Signed out: outlined person silhouette
              <Text style={styles.accountIcon}>👤</Text>
            )}
          </Pressable>
        )}

        {/* Bell */}
        {!searchOpen && (
          <Pressable style={styles.iconBtn} onPress={onPressBell}>
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        )}

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
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING['5'],
    paddingVertical:   SPACING['2'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor:   COLORS.background,
    minHeight:         58,
  },

  brand: { flexDirection: 'row', alignItems: 'center', gap: SPACING['2'], flex: 1 },
  logoRing: {
    width: 36, height: 36, borderRadius: RADII.full,
    borderWidth: 1, borderColor: COLORS.goldSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  logoImg:    { width: 26, height: 26, borderRadius: RADII.sm },
  brandName:  { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.lg,     fontWeight: TYPOGRAPHY.weight.bold },
  brandSub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size['2xs'], letterSpacing: 1.5, marginTop: 1 },

  // Search bar inline
  searchWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    borderWidth:     1,
    borderColor:     COLORS.goldSubtle,
    borderRadius:    RADII.full,
    paddingHorizontal: SPACING['3'],
    height:          38,
    marginRight:     SPACING['2'],
    flex:            1,
  },
  searchIconInline: { fontSize: 14, marginRight: SPACING['2'] },
  searchInput: {
    flex:       1,
    color:      COLORS.textPrimary,
    fontSize:   TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.family.sans,
    padding:    0,
  },

  actions: { flexDirection: 'row', alignItems: 'center', gap: SPACING['2'] },

  searchIcon: { fontSize: 16, color: COLORS.textSecondary },

  // Signed-in: small filled gold circle with initial
  avatarFilled: {
    width: 26, height: 26, borderRadius: RADII.full,
    backgroundColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { color: COLORS.textInverse, fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.extrabold },

  // Signed-out: person emoji at consistent icon size
  accountIcon:  { fontSize: 16 },

  iconBtn: {
    width: 38, height: 38, borderRadius: RADII.full,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  cartIcon: { fontSize: 16 },
  bellIcon: { fontSize: 16 },

  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: COLORS.gold, borderRadius: RADII.full,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: COLORS.textInverse, fontSize: 10, fontWeight: TYPOGRAPHY.weight.extrabold },
});
