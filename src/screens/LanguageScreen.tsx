/**
 * src/screens/LanguageScreen.tsx
 */

import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { useLanguage } from '@hooks/useLanguage';
import type { SupportedLanguage } from '@store/language.store';

const LANGUAGES: { code: SupportedLanguage; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English',  native: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'Arabic',   native: 'العربية', flag: '🇦🇪' },
];

const REGIONS = [
  { code: 'AE', label: 'United Arab Emirates', native: 'الإمارات العربية المتحدة', flag: '🇦🇪', currency: 'AED' },
];

export function LanguageScreen() {
  const { language, changeLanguage, t } = useLanguage();

  const handleSelect = async (code: SupportedLanguage) => {
    if (code === language) return;
    if (code === 'ar') {
      Alert.alert(
        'Switch to Arabic',
        'The app will switch to Arabic (RTL layout). You may need to restart the app for the full layout change to take effect.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Switch', onPress: () => changeLanguage(code) },
        ]
      );
    } else {
      await changeLanguage(code);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      {/* Language */}
      <Text style={styles.sectionTitle}>
        {t('Language', 'اللغة')}
      </Text>
      <View style={styles.card}>
        {LANGUAGES.map((lang, i) => {
          const active = language === lang.code;
          return (
            <Pressable
              key={lang.code}
              style={[
                styles.row,
                i < LANGUAGES.length - 1 && styles.rowBorder,
              ]}
              onPress={() => handleSelect(lang.code)}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{lang.label}</Text>
                <Text style={styles.rowSub}>{lang.native}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Region */}
      <Text style={[styles.sectionTitle, { marginTop: SPACING['6'] }]}>
        {t('Region', 'المنطقة')}
      </Text>
      <View style={styles.card}>
        {REGIONS.map((region) => (
          <View key={region.code} style={styles.row}>
            <Text style={styles.flag}>{region.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{region.label}</Text>
              <Text style={styles.rowSub}>{region.native} · {region.currency}</Text>
            </View>
            <View style={[styles.radio, styles.radioActive]}>
              <View style={styles.radioDot} />
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.regionNote}>
        {t(
          'More regions coming soon. Currency is displayed in AED.',
          'المزيد من المناطق قريبًا. تُعرض العملة بالدرهم الإماراتي.',
        )}
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING['5'], paddingBottom: SPACING['12'] },

  sectionTitle: {
    color:        COLORS.textSecondary,
    fontSize:     TYPOGRAPHY.size['2xs'],
    fontWeight:   TYPOGRAPHY.weight.semibold,
    letterSpacing: 1.2,
    marginBottom:  SPACING['2'],
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADII.xl,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       SPACING['4'],
    gap:           SPACING['3'],
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  flag:     { fontSize: 24 },
  rowLabel: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  rowSub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },

  radio: {
    width: 22, height: 22, borderRadius: RADII.full,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.gold },
  radioDot:    { width: 10, height: 10, borderRadius: RADII.full, backgroundColor: COLORS.gold },

  regionNote: {
    color:     COLORS.textSecondary,
    fontSize:  TYPOGRAPHY.size.xs,
    marginTop: SPACING['3'],
    lineHeight: TYPOGRAPHY.size.xs * 1.6,
  },
});
