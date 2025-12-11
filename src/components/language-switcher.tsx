'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { i18n, type Locale } from '@/i18n-config';

export default function LanguageSwitcher() {
    const pathname = usePathname();

    const redirectedPathName = (locale: Locale) => {
        if (!pathname) return '/';
        const segments = pathname.split('/');
        if (segments.length > 1) {
            segments[1] = locale;
        } else {
            return `/${locale}${pathname}`;
        }
        return segments.join('/');
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
        }}>
            {i18n.locales.map((locale) => {
                const isActive = pathname.startsWith(`/${locale}`);
                return (
                    <Link
                        key={locale}
                        href={redirectedPathName(locale)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.85rem',
                            fontWeight: isActive ? '700' : '500',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                            background: isActive ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {locale === 'fa' ? 'فا' : locale === 'sv' ? 'SV' : locale === 'de' ? 'DE' : 'EN'}
                    </Link>
                )
            })}
        </div>
    );
}
