import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './locales/en';
import zh from './locales/zh';


const resources = { en: { translation: en }, zh: { translation: zh } } as const;


const { languageTag } = RNLocalize.getLocales()[0] ?? { languageTag: 'en' };


i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        lng: languageTag.startsWith('zh') ? 'zh' : 'en',
        fallbackLng: 'en',
        resources,
        interpolation: { escapeValue: false },
        react: { useSuspense: false }, // <- don’t rely on Suspense in RN
        initImmediate: false,          // <- initialize synchronously
    });


export default i18n;