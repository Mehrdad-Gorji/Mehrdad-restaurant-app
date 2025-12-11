'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import ReviewList from './review-list';
import ReviewForm from './review-form';

export default function ProductDetailClient({ product, lang }: any) {
    const { addToCart } = useCart();
    const router = useRouter();

    const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]?.id || '');
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

    const basePrice = product.price;
    const sizePrice = product.sizes.find((s: any) => s.id === selectedSize)?.priceModifier || 0;

    const extrasPrice = selectedExtras.reduce((sum, extraId) => {
        const extra = product.extras.find((e: any) => e.id === extraId);
        return sum + (extra?.price || 0);
    }, 0);

    const totalPrice = basePrice + sizePrice + extrasPrice;

    const toggleExtra = (id: string) => {
        if (selectedExtras.includes(id)) {
            setSelectedExtras(prev => prev.filter(e => e !== id));
        } else {
            setSelectedExtras(prev => [...prev, id]);
        }
    };

    const handleAddToCart = () => {
        const sizeObj = product.sizes.find((s: any) => s.id === selectedSize);
        const extrasObjs = product.extras.filter((e: any) => selectedExtras.includes(e.id)).map((e: any) => ({
            id: e.id,
            name: e.name,
            price: e.price
        }));

        addToCart({
            productId: product.id,
            name: product.name,
            price: totalPrice,
            quantity: 1,
            sizeName: sizeObj?.name,
            extras: extrasObjs,
            image: product.image
        });

        router.push(`/${lang}/cart`);
    };

    return (
        <div style={{
            background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
            minHeight: '100vh',
            padding: '2rem 0'
        }}>
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div className="product-modal-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px, 1fr) minmax(300px, 1.2fr)',
                    gap: '2rem',
                    background: 'linear-gradient(145deg, rgba(30,30,30,0.98) 0%, rgba(15,15,15,0.98) 100%)',
                    border: '2px solid rgba(255, 152, 0, 0.3)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 100px rgba(255,152,0,0.15)'
                }}>
                    {/* Image Section */}
                    <div className="product-modal-image" style={{
                        height: '100%',
                        minHeight: '400px',
                        background: product.image
                            ? `url(${product.image}) center/cover`
                            : 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        borderRadius: '24px 0 0 24px'
                    }}>
                        {!product.image && (
                            <span style={{ fontSize: '6rem', filter: 'grayscale(0.1)' }}>🍕</span>
                        )}
                        {/* Gradient overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                            borderRadius: '0 0 0 24px'
                        }} />
                    </div>

                    {/* Details Section */}
                    <div className="product-modal-content" style={{
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div>
                            <h1 className="product-modal-title" style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: '0.75rem',
                                background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.8))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>{product.name}</h1>

                            {/* Rating */}
                            {(product as any).averageRating > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span key={star} style={{
                                                color: star <= Math.round((product as any).averageRating) ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                                                fontSize: '1.2rem'
                                            }}>★</span>
                                        ))}
                                    </div>
                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>
                                        {(product as any).averageRating.toFixed(1)}
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                                        ({(product as any).reviewCount} {lang === 'fa' ? 'نظر' : 'reviews'})
                                    </span>
                                </div>
                            )}
                            <p style={{
                                fontSize: '1rem',
                                color: 'rgba(255,255,255,0.6)',
                                lineHeight: '1.6'
                            }}>
                                {product.description || 'A delicious choice from our kitchen to your table.'}
                            </p>
                        </div>

                    </div>

                    {/* Tab Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('details')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'details' ? '#ff9800' : 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50px',
                                color: activeTab === 'details' ? '#000' : '#fff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            📝 {lang === 'fa' ? 'جزئیات' : 'Details'}
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'reviews' ? '#ff9800' : 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50px',
                                color: activeTab === 'reviews' ? '#000' : '#fff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            ⭐ {lang === 'fa' ? 'نظرات' : 'Reviews'}
                        </button>
                    </div>

                    {/* Details Content */}
                    {activeTab === 'details' && (
                        <>
                            {/* Size Selection */}
                            <div>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '1rem',
                                    color: '#fff',
                                    fontWeight: '600'
                                }}>{lang === 'fa' ? 'انتخاب سایز' : 'Choose Size'}</h3>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {product.sizes.map((size: any) => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size.id)}
                                            style={{
                                                padding: '0.75rem 1.25rem',
                                                border: `2px solid ${selectedSize === size.id ? '#ff9800' : 'rgba(255,255,255,0.15)'}`,
                                                backgroundColor: selectedSize === size.id ? 'rgba(255,152,0,0.15)' : 'rgba(255,255,255,0.05)',
                                                color: selectedSize === size.id ? '#ff9800' : 'rgba(255,255,255,0.7)',
                                                borderRadius: '12px',
                                                fontWeight: selectedSize === size.id ? '700' : '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {size.name} {size.priceModifier > 0 && <span style={{ fontSize: '0.8em', opacity: 0.8 }}>(+{size.priceModifier})</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Extras Selection */}
                            {product.extras.length > 0 && (
                                <div>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        marginBottom: '1rem',
                                        color: '#fff',
                                        fontWeight: '600'
                                    }}>{lang === 'fa' ? 'افزودنی‌های دلخواه' : 'Add Extras'}</h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                        gap: '0.75rem'
                                    }}>
                                        {product.extras.map((extra: any) => (
                                            <div
                                                key={extra.id}
                                                onClick={() => toggleExtra(extra.id)}
                                                style={{
                                                    padding: '0.75rem',
                                                    border: `2px solid ${selectedExtras.includes(extra.id) ? '#ff9800' : 'rgba(255,255,255,0.1)'}`,
                                                    backgroundColor: selectedExtras.includes(extra.id) ? 'rgba(255,152,0,0.15)' : 'rgba(255,255,255,0.05)',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.5rem',
                                                    transition: 'all 0.2s ease',
                                                    alignItems: 'center',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {extra.image && (
                                                    <img src={extra.image} alt={extra.name} style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        objectFit: 'cover',
                                                        borderRadius: '50%',
                                                        border: '2px solid rgba(255,255,255,0.1)'
                                                    }} />
                                                )}
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{
                                                        fontWeight: '500',
                                                        color: selectedExtras.includes(extra.id) ? '#ff9800' : 'rgba(255,255,255,0.8)',
                                                        fontSize: '0.85rem'
                                                    }}>{extra.name}</span>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        color: 'rgba(255,255,255,0.5)'
                                                    }}>+{extra.price} SEK</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pricing & Cart Action */}
                            <div style={{
                                marginTop: 'auto',
                                padding: '1.25rem',
                                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 107, 107, 0.05))',
                                border: '1px solid rgba(255, 152, 0, 0.3)',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <span style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {lang === 'fa' ? 'قیمت نهایی' : 'Total Price'}
                                    </span>
                                    <span style={{
                                        fontSize: '1.75rem',
                                        fontWeight: '800',
                                        background: 'linear-gradient(135deg, #ff9800, #ff6b6b)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {totalPrice} <span style={{
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            background: 'none',
                                            WebkitTextFillColor: 'rgba(255,255,255,0.6)'
                                        }}>SEK</span>
                                    </span>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    style={{
                                        padding: '0.9rem 2rem',
                                        background: 'linear-gradient(135deg, #ff9800, #ff6b6b)',
                                        border: 'none',
                                        borderRadius: '50px',
                                        color: '#fff',
                                        fontWeight: '700',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {lang === 'fa' ? 'افزودن به سبد' : 'Add to Cart'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Reviews Content */}
                    {activeTab === 'reviews' && (
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <ReviewList productId={product.id} lang={lang} />
                            <div style={{ marginTop: '1.5rem' }}>
                                <ReviewForm productId={product.id} productName={product.name} lang={lang} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
