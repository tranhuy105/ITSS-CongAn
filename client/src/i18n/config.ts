import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ja from './locales/ja.json';
import vi from './locales/vi.json';

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    vi: { translation: vi },
  },
  lng: localStorage.getItem('language') || 'ja',
  fallbackLng: 'ja',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
