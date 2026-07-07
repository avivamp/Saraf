/**
 * src/store/language.store.ts
 *
 * Persists language preference locally (AsyncStorage) and optionally
 * syncs to Supabase user_preferences for cross-device consistency.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportedLanguage = 'en' | 'ar';

interface LanguageState {
  language:    SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language:    'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name:    'saraf-language',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
