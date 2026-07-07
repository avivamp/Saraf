/**
 * src/screens/PolicyScreen.tsx
 */

import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, TYPOGRAPHY, SPACING } from '@constants/design';
import { HelpService } from '@services/help.service';
import { useLanguage } from '@hooks/useLanguage';
import type { ProfileStackParamList } from '@types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Policy'>;

export function PolicyScreen({ route }: Props) {
  const { policyId } = route.params;
  const { t, isRTL } = useLanguage();

  const { data: policy, isLoading, isError } = useQuery({
    queryKey:  ['policy', policyId],
    queryFn:   () => HelpService.fetchPolicy(policyId),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  if (isError || !policy) {
    return (
      <View style={styles.state}>
        <Text style={styles.errorText}>
          {t('Could not load policy.', 'تعذّر تحميل السياسة.')}
        </Text>
      </View>
    );
  }

  const content = t(policy.content_en, policy.content_ar);

  // Simple markdown-like renderer — handles ## headings, **bold**, bullet lists
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <Text key={i} style={[styles.h2, isRTL && styles.rtl]}>
            {line.replace('## ', '')}
          </Text>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <Text key={i} style={[styles.h3, isRTL && styles.rtl]}>
            {line.replace('### ', '')}
          </Text>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <View key={i} style={[styles.bulletRow, isRTL && styles.bulletRowRTL]}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[styles.bulletText, isRTL && styles.rtl]}>
              {line.replace(/^[-*] /, '')}
            </Text>
          </View>
        );
      }
      if (line.trim() === '') return <View key={i} style={styles.spacer} />;
      // Handle **bold** inline
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <Text key={i} style={[styles.body, isRTL && styles.rtl]}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <Text key={j} style={styles.bold}>{part.slice(2, -2)}</Text>
              : part
          )}
        </Text>
      );
    });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={[styles.lastUpdated, isRTL && styles.rtl]}>
        {t('Last updated:', 'آخر تحديث:')}{' '}
        {new Date(policy.updated_at).toLocaleDateString(
          isRTL ? 'ar-AE' : 'en-AE',
          { year: 'numeric', month: 'long', day: 'numeric' }
        )}
      </Text>
      {renderContent(content)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING['5'], paddingBottom: SPACING['12'] },
  state:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm },

  lastUpdated: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, marginBottom: SPACING['4'] },
  rtl:  { textAlign: 'right', writingDirection: 'rtl' },

  h2: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size['2xl'], fontWeight: TYPOGRAPHY.weight.bold, marginTop: SPACING['5'], marginBottom: SPACING['2'] },
  h3: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.lg,    fontWeight: TYPOGRAPHY.weight.bold, marginTop: SPACING['4'], marginBottom: SPACING['1'] },

  body:  { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm, lineHeight: TYPOGRAPHY.size.sm * 1.7, marginBottom: SPACING['1'] },
  bold:  { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weight.bold },
  spacer:{ height: SPACING['3'] },

  bulletRow:    { flexDirection: 'row', gap: SPACING['2'], marginBottom: SPACING['1'] },
  bulletRowRTL: { flexDirection: 'row-reverse' },
  bullet:       { color: COLORS.goldSubtle, fontSize: TYPOGRAPHY.size.sm, lineHeight: TYPOGRAPHY.size.sm * 1.7 },
  bulletText:   { flex: 1, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm, lineHeight: TYPOGRAPHY.size.sm * 1.7 },
});
