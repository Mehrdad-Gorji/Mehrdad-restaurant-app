'use client';

import { useLayout } from '@/context/layout-context';
import { useState, useEffect } from 'react';

interface WidthToggleProps {
    lang?: string;
}

export default function WidthToggle({ lang = 'en' }: WidthToggleProps) {
    const { isFullWidth, toggleLayoutMode } = useLayout();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    const labels: Record<string, { standard: string; fullwidth: string; tooltip: string }> = {
        en: {
            standard: 'Standard',
            fullwidth: 'Full Width',
            tooltip: 'Toggle page width'
        },
        sv: {
            standard: 'Standard',
            fullwidth: 'Full bredd',
            tooltip: 'Växla sidbredd'
        },
        de: {
            standard: 'Standard',
            fullwidth: 'Volle Breite',
            tooltip: 'Seitenbreite umschalten'
        },
        fa: {
            standard: 'استاندارد',
            fullwidth: 'تمام عرض',
            tooltip: 'تغییر عرض صفحه'
        }
    };

    const t = labels[lang] || labels.en;

    return (
        <button
            onClick={toggleLayoutMode}
            title={t.tooltip}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.5)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
        >
            <span style={{ fontSize: '1rem' }}>
                {isFullWidth ? '🖥️' : '📱'}
            </span>
            <span>
                {isFullWidth ? t.fullwidth : t.standard}
            </span>
        </button>
    );
}
