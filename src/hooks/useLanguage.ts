/**
 * src/hooks/useLanguage.ts
 *
 * Central hook for all i18n needs.
 *
 * Usage:
 *   const { lang, t, isRTL, setLanguage } = useLanguage();
 *   <Text style={isRTL && styles.rtl}>{t('Add to Cart', 'أضف إلى السلة')}</Text>
 */

import { I18nManager } from 'react-native';
import { useLanguageStore, type SupportedLanguage } from '@store/language.store';
import { supabase } from '@lib/supabase';
import { useAuthStore } from '@store/auth.store';

export function useLanguage() {
  const language    = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const user        = useAuthStore((s) => s.user);

  const isRTL = language === 'ar';

  /**
   * Pick the correct string for the current language.
   * t('English text', 'النص العربي')
   */
  const t = (en: string, ar: string): string => (language === 'ar' ? ar : en);

  /**
   * Change language, update RTL layout, and persist to Supabase
   * if the user is signed in.
   */
  const changeLanguage = async (lang: SupportedLanguage) => {
    setLanguage(lang);

    // React Native RTL — takes effect on next render cycle
    I18nManager.forceRTL(lang === 'ar');

    // Persist to Supabase for cross-device sync
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, language: lang }, { onConflict: 'user_id' });
    }
  };

  /**
   * Load language preference from Supabase when user signs in.
   * Call once in useAuth after sign-in.
   */
  const syncFromSupabase = async (userId: string) => {
    const { data } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', userId)
      .maybeSingle();

    if (data?.language && data.language !== language) {
      await changeLanguage(data.language as SupportedLanguage);
    }
  };

  return { language, isRTL, t, changeLanguage, syncFromSupabase };
}
