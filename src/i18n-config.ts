export const i18n = {
    defaultLocale: 'sv',
    locales: ['sv', 'en', 'de', 'fa'], // Added 'en' just in case, but will focus on sv, de, fa
} as const;

export type Locale = (typeof i18n)['locales'][number];
