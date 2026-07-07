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
import { useAuthStore, selectUser } from '@store/auth.store';
import type { CartStackParamList } from '@types';

const fmt = (n: number) => 'AED ' + Math.round(n).toLocaleString('en-US');

type Props = NativeStackScreenProps<CartStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { lines, subtotal, clear } = useCart();
  const { placeOrder, isPlacing }  = useOrders();
  const user    = useAuthStore(selectUser);

  const [name,       setName]       = useState(user?.user_metadata?.['full_name'] ?? '');
  const [guestEmail, setGuestEmail] = useState('');
  const [card,       setCard]       = useState('');
  const [exp,        setExp]        = useState('');
  const [cvv,        setCvv]        = useState('');
  const [saveCard,   setSaveCard]   = useState(true);

  useEffect(() => {
    if (user) setName((user.user_metadata?.['full_name'] as string | undefined) ?? '');
  }, [user]);

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    // Strip non-digits
    const digits = v.replace(/\D/g, '').slice(0, 4);
    // Auto-insert '/' after 2 digits
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const expiryValid = (v: string): boolean => {
    const match = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!match) return false;
    const month = parseInt(match[1]!, 10);
    const year  = parseInt(match[2]!, 10) + 2000;
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expDate = new Date(year, month - 1, 1); // first of expiry month
    // Valid if expiry month/year is current month or later
    return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const isValid =
    name.trim().length > 1 &&
    card.replace(/\s/g, '').length >= 12 &&
    expiryValid(exp) &&
    cvv.length >= 3 &&
    (!!user || emailValid(guestEmail));   // guest must supply a valid email

  const handlePay = () => {
    const resolvedEmail = user ? user.email! : guestEmail.trim();
    placeOrder({
      userId:     user?.id ?? null,
      guestEmail: user ? null : resolvedEmail,
      cart:       lines,
      total:      subtotal,
      cardSaved:  saveCard,
    });
    // Do NOT navigate here — placeOrder is async and its onSuccess handler
    // calls showSuccess() which displays the SuccessOverlay. That overlay's
    // "Back to Flexing" button navigates to CatalogTab via navigationRef,
    // clearing the stack cleanly. Navigating here would send the user to
    // Cart before the overlay appears.
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
          onPress={() => navigation.getParent()?.navigate('ProfileTab')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.pillLabel}>{user ? 'SIGNED IN AS' : 'CHECKING OUT AS'}</Text>
            <Text style={styles.pillValue}>{user ? user.email : 'Guest'}</Text>
          </View>
          <Text style={styles.pillSwitch}>{user ? 'Switch' : 'Sign In'}</Text>
        </Pressable>

        {/* Guest email — only shown when not signed in */}
        {!user && (
          <View style={styles.guestEmailWrap}>
            <Text style={styles.guestEmailTitle}>Enter your email address</Text>
            <Text style={styles.guestEmailSub}>
              We'll save your order against this email. If you create an account
              later with the same address, this order will appear in your history.
            </Text>
            <TextInput
              label="Email Address"
              value={guestEmail}
              onChangeText={setGuestEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.field}
            />
            {guestEmail.length > 3 && !emailValid(guestEmail) && (
              <Text style={styles.emailError}>Please enter a valid email address.</Text>
            )}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ SATIRICAL APP — No real money or goods involved. Card details are never transmitted.
          </Text>
        </View>

        <TextInput label="Cardholder Name"   value={name} onChangeText={setName} placeholder="Sheikh Spends-A-Lot" style={styles.field} />
        <TextInput label="Card Number (Fake)" value={card} onChangeText={(v) => setCard(formatCard(v))} placeholder="0000 0000 0000 0000" keyboardType="number-pad" mono style={styles.field} />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <TextInput
              label="Expiry"
              value={exp}
              onChangeText={(v) => setExp(formatExpiry(v))}
              placeholder="MM/YY"
              keyboardType="number-pad"
              mono
            />
            {exp.length > 0 && !expiryValid(exp) && exp.length === 5 && (
              <Text style={styles.fieldError}>Invalid or expired date</Text>
            )}
          </View>
          <TextInput label="CVV" value={cvv} onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))} placeholder="000" keyboardType="number-pad" secureTextEntry mono style={styles.halfField} />
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

  guestEmailWrap: {
    backgroundColor: COLORS.surfaceRaised,
    borderWidth:     1,
    borderColor:     COLORS.goldSubtle,
    borderRadius:    RADII.lg,
    padding:         SPACING['4'],
    marginBottom:    SPACING['4'],
  },
  guestEmailTitle: { color: COLORS.goldBright,    fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['1'] },
  guestEmailSub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, lineHeight: TYPOGRAPHY.size.xs * 1.6, marginBottom: SPACING['3'] },
  emailError:  { color: COLORS.error, fontSize: TYPOGRAPHY.size.xs, marginTop: SPACING['1'] },
  fieldError:  { color: COLORS.error, fontSize: TYPOGRAPHY.size.xs, marginTop: SPACING['1'] },

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
