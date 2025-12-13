'use client';

import { useState } from 'react';
import { useCurrency } from '@/hooks/use-currency';
import ProductDetailModal from './product-detail-modal';

interface Props {
    product: {
        id: string;
        slug: string;
        name: string;
        price: number;
        description?: string | null;
        image?: string | null;
        sizes?: any[];
        extras?: any[];
    };
    lang: string;
}

export default function ProductCard({ product, lang }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { formatCurrency } = useCurrency();
    const { formatCurrency } = useCurrency();

    return (
        <>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
            }} className="product-card">
                {/* Image Area */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        cursor: 'pointer',
                        height: '180px',
                        background: product.image
                            ? `url(${product.image}) center/cover`
                            : 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >
                    {!product.image && (
                        <span style={{ fontSize: '4rem', opacity: 0.3 }}>🍕</span>
                    )}
                    {/* Overlay Gradient */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                    }} />

                    {/* Filter Icons */}
                    <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        display: 'flex',
                        gap: '0.25rem',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                        maxWidth: '80%'
                    }}>
                        {(product as any).isSpicy && <span title="Spicy" style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}>🌶️</span>}
                        {(product as any).isVegetarian && <span title="Vegetarian" style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}>🥦</span>}
                        {(product as any).isGlutenFree && <span title="Gluten Free" style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}>🌾</span>}
                        {(product as any).isVegan && <span title="Vegan" style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}>🌱</span>}
                    </div>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 'auto' }}>
                        <h3
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                marginBottom: '0.5rem',
                                fontSize: '1.25rem',
                                color: '#fff',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >{product.name}</h3>
                        <p style={{
                            fontSize: '0.95rem',
                            color: 'rgba(255,255,255,0.5)',
                            marginBottom: '1rem',
                            lineHeight: '1.5',
                            maxHeight: 'calc(1.5em * 4)',
                            overflowY: 'auto'
                        }}>
                            {product.description || 'Delicious pizza with fresh ingredients.'}
                        </p>
                    </div>

                    {/* Rating */}
                    {(product as any).averageRating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span>
                            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {(product as any).averageRating.toFixed(1)}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                ({(product as any).reviewCount})
                            </span>
                        </div>
                    )}

                    <div style={{
                        marginTop: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>{formatCurrency(product.price)}</span>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: '50px',
                                background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {lang === 'fa' ? 'انتخاب' : lang === 'de' ? 'Wählen' : lang === 'sv' ? 'Välj' : 'Select'}
                        </button>
                    </div>
                </div>
            </div >

            {/* Product Detail Modal */}
            < ProductDetailModal
                product={product}
                lang={lang}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)
                }
            />
        </>
    );
}
