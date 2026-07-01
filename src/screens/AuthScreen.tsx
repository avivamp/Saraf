/**
 * src/screens/AuthScreen.tsx
 */

import React, { useState } from 'react';
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
import { useAuth }   from '@hooks/useAuth';
import type { AuthModalMode, ProfileStackParamList } from '@types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Auth'>;

export function AuthScreen({ route, navigation }: Props) {
  const initialMode = route.params?.mode ?? 'signin';
  const [mode, setMode]   = useState<AuthModalMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [info,     setInfo]     = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setInfo('');

    if (mode === 'signin') {
      if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
      setLoading(true);
      const result = await signIn(email.trim(), password);
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      navigation.goBack();

    } else {
      if (!fullName.trim() || !email.trim() || password.length < 6) {
        setError('Fill in your name, email, and a password (6+ characters).');
        return;
      }
      setLoading(true);
      const result = await signUp(email.trim(), password, fullName.trim());
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      if (result.data?.requiresConfirmation) {
        setInfo('Check your email to confirm your account, then sign in.');
        setMode('signin');
      } else {
        navigation.goBack();
      }
    }
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
        <Text style={styles.heading}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
        <Text style={styles.sub}>
          {mode === 'signin' ? 'Welcome back to Saraf.' : 'Join Saraf — entirely fictional, entirely free.'}
        </Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!!info && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{info}</Text>
          </View>
        )}

        {mode === 'signup' && (
          <TextInput label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Sheikh Spends-A-Lot" style={styles.field} />
        )}
        <TextInput label="Email"    value={email}    onChangeText={setEmail}    placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" style={styles.field} />
        <TextInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry style={styles.field} />

        <Button fullWidth size="lg" loading={loading} onPress={handleSubmit} style={styles.submitBtn}>
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>

        <Pressable
          style={styles.switchRow}
          onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
        >
          <Text style={styles.switchText}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.switchLink}>{mode === 'signin' ? 'Sign Up' : 'Sign In'}</Text>
          </Text>
        </Pressable>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ SATIRICAL APP — No real transactions. Supabase is used for auth only.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING['5'], paddingBottom: SPACING['12'] },

  heading: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size['3xl'], fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['1'] },
  sub:     { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,     marginBottom: SPACING['6'] },

  errorBox: { backgroundColor: COLORS.errorTint, borderWidth: 1, borderColor: `${COLORS.error}55`, borderRadius: RADII.md, padding: SPACING['3'], marginBottom: SPACING['4'] },
  errorText:{ color: COLORS.error, fontSize: TYPOGRAPHY.size.xs, lineHeight: TYPOGRAPHY.size.xs * 1.6 },
  infoBox:  { backgroundColor: `${COLORS.success}22`, borderWidth: 1, borderColor: `${COLORS.success}55`, borderRadius: RADII.md, padding: SPACING['3'], marginBottom: SPACING['4'] },
  infoText: { color: COLORS.success, fontSize: TYPOGRAPHY.size.xs, lineHeight: TYPOGRAPHY.size.xs * 1.6 },

  field:     { marginBottom: SPACING['4'] },
  submitBtn: { marginTop: SPACING['2'] },

  switchRow:  { alignItems: 'center', marginTop: SPACING['5'] },
  switchText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm },
  switchLink: { color: COLORS.goldBright, fontWeight: TYPOGRAPHY.weight.bold },

  disclaimer:     { marginTop: SPACING['8'], padding: SPACING['3'], backgroundColor: COLORS.surfaceRaised, borderRadius: RADII.md },
  disclaimerText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, textAlign: 'center', lineHeight: TYPOGRAPHY.size.xs * 1.6 },
});
