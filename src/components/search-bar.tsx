'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
    placeholder?: string;
    lang?: string;
}

export default function SearchBar({ placeholder, lang = 'en' }: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [isFocused, setIsFocused] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                const params = new URLSearchParams(searchParams.toString());
                params.set('q', searchTerm);
                router.push(`?${params.toString()}`, { scroll: false });
            } else {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('q');
                router.push(`?${params.toString()}`, { scroll: false });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleClear = () => {
        setSearchTerm('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('q');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const placeholderText = placeholder || {
        en: 'Search products...',
        sv: 'Sök produkter...',
        de: 'Produkte suchen...',
        fa: 'جستجوی محصولات...'
    }[lang] || 'Search products...';

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: isFocused
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                border: isFocused
                    ? '2px solid rgba(255, 152, 0, 0.5)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                padding: '0.75rem 1.5rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Search Icon */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        color: isFocused ? '#ff9800' : 'rgba(255, 255, 255, 0.5)',
                        marginRight: '0.75rem',
                        flexShrink: 0,
                        transition: 'color 0.3s ease'
                    }}
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>

                {/* Input */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholderText}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        width: '100%'
                    }}
                />

                {/* Clear Button */}
                {searchTerm && (
                    <button
                        onClick={handleClear}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginLeft: '0.5rem',
                            flexShrink: 0,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Search hint */}
            {isFocused && !searchTerm && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    padding: '1rem',
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    zIndex: 10
                }}>
                    💡 {lang === 'sv' ? 'Börja skriva för att söka...' :
                        lang === 'de' ? 'Beginnen Sie mit der Eingabe...' :
                            lang === 'fa' ? 'شروع به تایپ کنید...' :
                                'Start typing to search...'}
                </div>
            )}
        </div>
    );
}
