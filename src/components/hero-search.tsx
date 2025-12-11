'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeroSearchProps {
    lang: string;
    placeholder?: string;
    products: Array<{
        id: string;
        slug: string;
        name: string;
        price: number;
        image?: string | null;
    }>;
}

export default function HeroSearch({ lang, placeholder, products }: HeroSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState<typeof products>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter products based on search query
    useEffect(() => {
        if (query.trim().length > 1) {
            const lower = query.toLowerCase();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                p.slug.toLowerCase().includes(lower)
            ).slice(0, 5); // Max 5 results
            setFilteredProducts(filtered);
            setShowResults(filtered.length > 0);
        } else {
            setFilteredProducts([]);
            setShowResults(false);
        }
    }, [query, products]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/${lang}/menu?search=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleProductClick = (slug: string) => {
        router.push(`/${lang}/menu?product=${slug}`);
        setShowResults(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                padding: '0.5rem',
                borderRadius: showResults ? '25px 25px 0 0' : '50px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'border-radius 0.2s ease'
            }}>
                <span style={{ fontSize: '1.2rem', marginLeft: '1rem', marginRight: '0.5rem' }}>🔍</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder || "Search for pizza, pasta..."}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        flex: 1,
                        fontSize: '1rem',
                        outline: 'none',
                        color: '#333',
                        padding: '0.5rem'
                    }}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                        padding: '0.6rem 1.2rem',
                        fontSize: '1rem',
                        borderRadius: '40px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {lang === 'sv' ? 'Sök' : lang === 'de' ? 'Suchen' : lang === 'fa' ? 'جستجو' : 'Search'} →
                </button>
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0 0 20px 20px',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    zIndex: 100
                }}>
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product.slug)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '10px',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.3rem'
                                }}>
                                    🍕
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                                    {product.name}
                                </div>
                                <div style={{ color: '#ff5722', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {product.price} SEK
                                </div>
                            </div>
                            <span style={{ color: '#999', fontSize: '1.2rem' }}>→</span>
                        </div>
                    ))}
                    <div
                        onClick={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
                        style={{
                            padding: '0.75rem 1rem',
                            textAlign: 'center',
                            color: '#ff5722',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: 'rgba(255, 87, 34, 0.05)'
                        }}
                    >
                        {lang === 'sv' ? 'Visa alla resultat' : lang === 'de' ? 'Alle Ergebnisse' : lang === 'fa' ? 'نمایش همه نتایج' : 'View all results'} →
                    </div>
                </div>
            )}
        </div>
    );
}
