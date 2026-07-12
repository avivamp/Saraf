/**
 * src/screens/ProfileScreen.tsx
 */

import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { Button } from '@components/ui/Button';
import { useNotifications } from '@hooks/useNotifications';
import { useAuth }          from '@hooks/useAuth';
import { useLanguage }      from '@hooks/useLanguage';
import { useAuthStore, selectUser } from '@store/auth.store';
import type { ProfileStackParamList } from '@types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

const HELP_CENTER_URL = 'https://www.finwyl.com/saraf/en/help-center';

// ── Reusable menu row ─────────────────────────────────────────
function MenuRow({ icon, label, onPress, badge }: {
  icon:    string;
  label:   string;
  onPress: () => void;
  badge?:  number;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      {badge != null && badge > 0 && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <Text style={styles.menuChevron}>›</Text>
    </Pressable>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

// ── Screen ─────────────────────────────────────────────────────
export function ProfileScreen({ navigation }: Props) {
  const user            = useAuthStore(selectUser);
  const { signOut }     = useAuth();
  const { unreadCount } = useNotifications();
  const { t }           = useLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      {/* ── Avatar / Sign-in header ── */}
      {user ? (
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{user.email?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.user_metadata?.['full_name'] ?? 'Saraf Customer'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      ) : (
        <View style={styles.guestWrap}>
          <Text style={styles.guestEmoji}>👤</Text>
          <Text style={styles.guestTitle}>{t('Sign in to Saraf', 'تسجيل الدخول إلى سرف')}</Text>
          <Text style={styles.guestSub}>
            {t(
              'View your orders, save your cart, and check out faster.',
              'اعرض طلباتك، احفظ سلة التسوق، وأكمل الدفع بشكل أسرع.',
            )}
          </Text>
          <Button fullWidth size="lg" onPress={() => navigation.navigate('Auth', { mode: 'signin' })} style={{ marginTop: SPACING['5'] }}>
            {t('Sign In', 'تسجيل الدخول')}
          </Button>
          <Button fullWidth size="lg" variant="ghost" onPress={() => navigation.navigate('Auth', { mode: 'signup' })} style={{ marginTop: SPACING['2'] }}>
            {t('Create Account', 'إنشاء حساب')}
          </Button>
        </View>
      )}

      {/* ── Account section (signed-in only) ── */}
      {user && (
        <>
          <SectionHeader label={t('ACCOUNT', 'الحساب')} />
          <View style={styles.card}>
            <MenuRow icon="🔔" label={t('Notifications', 'الإشعارات')} badge={unreadCount} onPress={() => navigation.navigate('Notifications')} />
            <View style={styles.divider} />
            <MenuRow icon="📦" label={t('My Orders', 'طلباتي')}         onPress={() => navigation.navigate('Orders')} />
            <View style={styles.divider} />
            <MenuRow icon="💬" label={t('Share Feedback', 'مشاركة الملاحظات')} onPress={() => navigation.navigate('Feedback')} />
          </View>
        </>
      )}

      {/* ── Preferences ── */}
      <SectionHeader label={t('PREFERENCES', 'التفضيلات')} />
      <View style={styles.card}>
        <MenuRow icon="🌐" label={t('Language & Region', 'اللغة والمنطقة')} onPress={() => navigation.navigate('Language')} />
      </View>

      {/* ── Support ── */}
      <SectionHeader label={t('SUPPORT', 'الدعم')} />
      <View style={styles.card}>
        <MenuRow icon="❓" label={t('Help Center', 'مركز المساعدة')} onPress={() => Linking.openURL(HELP_CENTER_URL)} />
        {!user && (
          <>
            <View style={styles.divider} />
            <MenuRow icon="💬" label={t('Share Feedback', 'مشاركة الملاحظات')} onPress={() => navigation.navigate('Feedback')} />
          </>
        )}
      </View>

      {/* ── Sign out ── */}
      {user && (
        <Button fullWidth size="lg" variant="danger" onPress={signOut} style={styles.signOutBtn}>
          {t('Sign Out', 'تسجيل الخروج')}
        </Button>
      )}

      <Text style={styles.legal}>
        {t(
          'Saraf is a satirical, fictional shopping experience.',
          'سرف هو تجربة تسوق ساخرة خيالية.',
        )}
      </Text>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.background },
  root:    { flex: 1 },
  content: { padding: SPACING['5'], paddingBottom: SPACING['12'] },

  // Avatar
  avatarWrap: { alignItems: 'center', paddingVertical: SPACING['6'] },
  avatar: {
    width: 80, height: 80, borderRadius: RADII.full,
    backgroundColor: 'rgba(212,176,94,0.12)',
    borderWidth: 1.5, borderColor: COLORS.goldSubtle,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING['3'],
  },
  avatarLetter: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size['4xl'], fontWeight: TYPOGRAPHY.weight.bold },
  name:  { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.xl,  fontWeight: TYPOGRAPHY.weight.bold },
  email: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,  marginTop: SPACING['1'] },

  // Guest
  guestWrap:  { alignItems: 'center', paddingVertical: SPACING['8'] },
  guestEmoji: { fontSize: 56, marginBottom: SPACING['4'] },
  guestTitle: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size['2xl'], fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['2'] },
  guestSub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,     textAlign: 'center', lineHeight: TYPOGRAPHY.size.sm * 1.6 },

  // Sections
  sectionHeader: {
    color:        COLORS.textSecondary,
    fontSize:     TYPOGRAPHY.size['2xs'],
    fontWeight:   TYPOGRAPHY.weight.semibold,
    letterSpacing: 1.4,
    marginTop:    SPACING['5'],
    marginBottom:  SPACING['2'],
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADII.xl,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: SPACING['4'] },

  // Menu row
  menuRow: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       SPACING['4'],
    gap:           SPACING['3'],
  },
  menuIcon:    { fontSize: 18, width: 24, textAlign: 'center' },
  menuLabel:   { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  menuChevron: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.lg },
  menuBadge: {
    backgroundColor: COLORS.error,
    borderRadius:    RADII.full,
    minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING['1'],
  },
  menuBadgeText: { color: '#fff', fontSize: 10, fontWeight: TYPOGRAPHY.weight.extrabold },

  signOutBtn: { marginTop: SPACING['5'] },
  legal:      { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, textAlign: 'center', marginTop: SPACING['8'], lineHeight: TYPOGRAPHY.size.xs * 1.7 },
});
