/**
 * src/screens/CheckoutScreen.tsx
 */

import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { Button }    from '@components/ui/Button';
import { TextInput } from '@components/ui/TextInput';
import { useCart }   from '@hooks/useCart';
import { useOrders } from '@hooks/useOrders';
import { useAuthStore, selectUser, selectIsGuest } from '@store/auth.store';
import { useUIStore } from '@store/ui.store';
import type { CartStackParamList } from '@types';

const fmt = (n: number) => 'AED ' + Math.round(n).toLocaleString('en-US');

type Props = NativeStackScreenProps<CartStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { lines, subtotal, clear } = useCart();
  const { placeOrder, isPlacing } = useOrders();
  const user    = useAuthStore(selectUser);
  const isGuest = useAuthStore(selectIsGuest);
  const { openAuth: _openAuth } = useUIStore(); // reserved for future use

  const [name,     setName]     = useState(user?.user_metadata?.['full_name'] ?? '');
  const [card,     setCard]     = useState('');
  const [exp,      setExp]      = useState('');
  const [cvv,      setCvv]      = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Pre-fill name when user becomes known
  useEffect(() => {
    if (user) setName((user.user_metadata?.['full_name'] as string | undefined) ?? '');
  }, [user]);

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const isValid =
    name.trim().length > 1 &&
    card.replace(/\s/g, '').length >= 12 &&
    cvv.length >= 3;

  const handlePay = () => {
    if (!user && !isGuest) {
      navigation.getParent()?.navigate('ProfileTab');
      return;
    }
    if (!user) {
      // Guest — simulate, no DB write
      useUIStore.getState().showSuccess({ orderId: null, amount: subtotal, cardSaved: saveCard });
      clear();
      navigation.popToTop();
      return;
    }
    // Signed in — placeOrder mutation fires showSuccess on success
    placeOrder({ userId: user.id, cart: lines, total: subtotal, cardSaved: saveCard });
    navigation.popToTop();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Checkout</Text>
        <Text style={styles.sub}>Settle your imaginary tab.</Text>

        {/* Account status pill */}
        <Pressable
          style={styles.accountPill}
          onPress={() => openAuth(user ? 'account' : 'choice', 'checkout')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.pillLabel}>{user ? 'SIGNED IN AS' : 'CHECKING OUT AS'}</Text>
            <Text style={styles.pillValue}>{user ? user.email : 'Guest'}</Text>
          </View>
          <Text style={styles.pillSwitch}>{user ? 'Switch' : 'Sign In'}</Text>
        </Pressable>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ SATIRICAL APP — No real money or goods involved. Card details are never transmitted.
          </Text>
        </View>

        <TextInput label="Cardholder Name"   value={name} onChangeText={setName} placeholder="Sheikh Spends-A-Lot" style={styles.field} />
        <TextInput label="Card Number (Fake)" value={card} onChangeText={(v) => setCard(formatCard(v))} placeholder="0000 0000 0000 0000" keyboardType="number-pad" mono style={styles.field} />

        <View style={styles.row}>
          <TextInput label="Expiry" value={exp} onChangeText={(v) => setExp(v.slice(0, 5))} placeholder="MM/YY" mono style={styles.halfField} />
          <TextInput label="CVV"    value={cvv} onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))} placeholder="000" keyboardType="number-pad" secureTextEntry mono style={styles.halfField} />
        </View>

        {/* Save card toggle */}
        <Pressable style={styles.saveRow} onPress={() => setSaveCard((v) => !v)}>
          <View style={[styles.checkbox, saveCard && styles.checkboxOn]}>
            {saveCard && <Text style={styles.tick}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.saveLabel}>Save card for future purchases</Text>
            <Text style={styles.saveSub}>Stored securely (not really, this is fiction).</Text>
          </View>
        </Pressable>

        {/* Total + pay */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Due (Not Really)</Text>
          <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
        </View>

        <Button
          fullWidth
          size="lg"
          loading={isPlacing}
          disabled={!isValid || isPlacing}
          onPress={handlePay}
          style={styles.payBtn}
        >
          Pay Now
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING['5'], paddingBottom: SPACING['12'] },

  heading: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size['3xl'], fontWeight: TYPOGRAPHY.weight.bold,   marginBottom: SPACING['1'] },
  sub:     { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,     marginBottom: SPACING['5'] },

  accountPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceRaised, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADII.lg, padding: SPACING['3'], marginBottom: SPACING['4'],
  },
  pillLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size['2xs'], letterSpacing: 1 },
  pillValue: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.sm,     fontWeight: TYPOGRAPHY.weight.semibold, marginTop: 2 },
  pillSwitch:{ color: COLORS.goldBright,    fontSize: TYPOGRAPHY.size.xs,     fontWeight: TYPOGRAPHY.weight.bold },

  disclaimer: {
    backgroundColor: COLORS.errorTint, borderWidth: 1, borderColor: `${COLORS.error}55`,
    borderRadius: RADII.md, padding: SPACING['3'], marginBottom: SPACING['5'],
  },
  disclaimerText: { color: COLORS.error, fontSize: TYPOGRAPHY.size.xs, lineHeight: TYPOGRAPHY.size.xs * 1.6 },

  field:     { marginBottom: SPACING['4'] },
  row:       { flexDirection: 'row', gap: SPACING['3'], marginBottom: SPACING['4'] },
  halfField: { flex: 1 },

  saveRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING['3'], marginBottom: SPACING['6'] },
  checkbox:   { width: 20, height: 20, borderRadius: RADII.sm, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  tick:       { color: COLORS.textInverse, fontSize: 12, fontWeight: TYPOGRAPHY.weight.extrabold },
  saveLabel:  { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  saveSub:    { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },

  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING['5'] },
  totalLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm },
  totalValue: { color: COLORS.goldBright,    fontSize: TYPOGRAPHY.size['2xl'], fontWeight: TYPOGRAPHY.weight.bold, fontFamily: TYPOGRAPHY.family.mono },

  payBtn: { marginTop: SPACING['2'] },
});
