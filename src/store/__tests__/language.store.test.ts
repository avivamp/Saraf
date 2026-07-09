import { useLanguageStore } from '@store/language.store';

describe('language.store', () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: 'en' });
  });

  test('defaults to English', () => {
    expect(useLanguageStore.getState().language).toBe('en');
  });

  test('setLanguage switches to Arabic', () => {
    useLanguageStore.getState().setLanguage('ar');
    expect(useLanguageStore.getState().language).toBe('ar');
  });

  test('setLanguage can switch back to English', () => {
    useLanguageStore.getState().setLanguage('ar');
    useLanguageStore.getState().setLanguage('en');
    expect(useLanguageStore.getState().language).toBe('en');
  });
});
