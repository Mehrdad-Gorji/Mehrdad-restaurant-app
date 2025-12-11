import 'server-only';
import type { Locale } from '@/i18n-config';

const dictionaries = {
    sv: () => import('@/dictionaries/sv.json').then((module) => module.default),
    de: () => import('@/dictionaries/de.json').then((module) => module.default),
    fa: () => import('@/dictionaries/fa.json').then((module) => module.default),
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]?.() ?? dictionaries.sv();
