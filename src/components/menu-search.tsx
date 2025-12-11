'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface MenuSearchProps {
    lang: string;
    onSearch: (query: string) => void;
    initialQuery?: string;
}

export default function MenuSearch({ lang, onSearch, initialQuery = '' }: MenuSearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const q = searchParams.get('search');
        if (q) {
            setQuery(q);
            onSearch(q);
        }
    }, [searchParams, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
        router.push(`/${lang}/menu`);
    };

    const placeholders: Record<string, string> = {
        sv: 'Sök pizza, hamburgare...',
        de: 'Pizza, Burger suchen...',
        fa: 'جستجو پیتزا، همبرگر...',
        en: 'Search pizza, burger...'
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50px',
                padding: '0.5rem 1rem',
                width: '100%',
                maxWidth: '400px',
                gap: '0.75rem'
            }}>
                <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>🔍</span>
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder={placeholders[lang] || placeholders.en}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                />
                {query && (
                    <button
                        onClick={handleClear}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}
