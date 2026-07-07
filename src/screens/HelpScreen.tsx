/**
 * src/screens/HelpScreen.tsx
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { HelpService, type HelpArticle } from '@services/help.service';
import { useLanguage } from '@hooks/useLanguage';
import { useAppConfig } from '@hooks/useAppConfig';

export function HelpScreen() {
  const { t, isRTL }  = useLanguage();
  const config         = useAppConfig();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: articles = [], isLoading } = useQuery({
    queryKey:  ['help_articles'],
    queryFn:   HelpService.fetchArticles,
    staleTime: 1000 * 60 * 10,
  });

  const toggle = (id: string) => setExpanded((prev) => prev === id ? null : id);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, isRTL && styles.rtl]}>
        {t('Help Center', 'مركز المساعدة')}
      </Text>
      <Text style={[styles.sub, isRTL && styles.rtl]}>
        {t('Frequently asked questions', 'الأسئلة الشائعة')}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: SPACING['8'] }} />
      ) : (
        <View style={styles.list}>
          {articles.map((article, i) => {
            const open = expanded === article.id;
            const question = t(article.question_en, article.question_ar);
            const answer   = t(article.answer_en,   article.answer_ar);
            return (
              <View
                key={article.id}
                style={[styles.item, i < articles.length - 1 && styles.itemBorder]}
              >
                <Pressable
                  style={styles.itemHeader}
                  onPress={() => toggle(article.id)}
                >
                  <Text style={[styles.question, isRTL && styles.rtl, { flex: 1 }]}>
                    {question}
                  </Text>
                  <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
                </Pressable>
                {open && (
                  <Text style={[styles.answer, isRTL && styles.rtl]}>
                    {answer}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Contact */}
      <View style={styles.contactCard}>
        <Text style={[styles.contactTitle, isRTL && styles.rtl]}>
          {t('Still need help?', 'لا تزال بحاجة إلى مساعدة؟')}
        </Text>
        <Text style={[styles.contactLine, isRTL && styles.rtl]}>
          📧  {config.support_email}
        </Text>
        <Text style={[styles.contactLine, isRTL && styles.rtl]}>
          📞  {config.support_phone}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING['5'], paddingBottom: SPACING['12'] },

  heading: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size['3xl'], fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['1'] },
  sub:     { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,     marginBottom: SPACING['5'] },
  rtl:     { textAlign: 'right' },

  list: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADII.xl,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
    marginBottom:    SPACING['5'],
  },
  item:       { padding: SPACING['4'] },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING['3'] },
  question:   { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, lineHeight: TYPOGRAPHY.size.sm * 1.4 },
  chevron:    { color: COLORS.textSecondary, fontSize: 10 },
  answer:     { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm, lineHeight: TYPOGRAPHY.size.sm * 1.6, marginTop: SPACING['3'] },

  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADII.xl,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         SPACING['5'],
    gap:             SPACING['2'],
  },
  contactTitle: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['1'] },
  contactLine:  { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm },
});
