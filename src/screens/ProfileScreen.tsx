/**
 * src/screens/ProfileScreen.tsx
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { Button } from '@components/ui/Button';
import { useAuth } from '@hooks/useAuth';
import { useAuthStore, selectUser } from '@store/auth.store';
import type { ProfileStackParamList } from '@types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const user        = useAuthStore(selectUser);
  const { signOut } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {user ? (
        <>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{user.email?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{user.user_metadata?.['full_name'] ?? 'Saraf Customer'}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Button
              fullWidth
              size="lg"
              onPress={() => navigation.navigate('Orders')}
              style={styles.rowBtn}
            >
              My Orders
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="ghost"
              onPress={signOut}
              style={styles.rowBtn}
            >
              Sign Out
            </Button>
          </View>
        </>
      ) : (
        <View style={styles.guestWrap}>
          <Text style={styles.guestEmoji}>👤</Text>
          <Text style={styles.guestTitle}>Sign in to Saraf</Text>
          <Text style={styles.guestSub}>
            View your orders, save your cart across devices, and check out faster.
          </Text>
          <Button
            fullWidth size="lg"
            onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
            style={{ marginTop: SPACING['5'] }}
          >
            Sign In
          </Button>
          <Button
            fullWidth size="lg" variant="ghost"
            onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
            style={{ marginTop: SPACING['2'] }}
          >
            Create Account
          </Button>
        </View>
      )}

      <Text style={styles.legal}>
        Saraf is a satirical, fictional shopping experience. No real payments, no real goods.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING['5'], paddingBottom: SPACING['12'] },

  avatarWrap: { alignItems: 'center', paddingVertical: SPACING['8'] },
  avatar: {
    width: 80, height: 80, borderRadius: RADII.full,
    backgroundColor: 'rgba(212,176,94,0.12)',
    borderWidth: 1.5, borderColor: COLORS.goldSubtle,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING['3'],
  },
  avatarLetter: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size['4xl'], fontWeight: TYPOGRAPHY.weight.bold },
  name:  { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.xl,  fontWeight: TYPOGRAPHY.weight.bold },
  email: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,  marginTop: SPACING['1'] },

  section: { gap: SPACING['2'] },
  rowBtn:  {},

  guestWrap:  { alignItems: 'center', paddingVertical: SPACING['10'] },
  guestEmoji: { fontSize: 56, marginBottom: SPACING['4'] },
  guestTitle: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size['2xl'], fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['2'] },
  guestSub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,     textAlign: 'center', lineHeight: TYPOGRAPHY.size.sm * 1.6 },

  legal: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, textAlign: 'center', marginTop: SPACING['10'], lineHeight: TYPOGRAPHY.size.xs * 1.7 },
});
