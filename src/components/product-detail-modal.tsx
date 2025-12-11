'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import ReviewList from './review-list';
import ReviewForm from './review-form';

interface ProductDetailModalProps {
    product: any;
    lang: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDetailModal({ product, lang, isOpen, onClose }: ProductDetailModalProps) {
    const { addToCart } = useCart();
    const router = useRouter();

    const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0]?.id || '');
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

    // Reset selections when product changes
    useEffect(() => {
        if (product) {
            setSelectedSize(product.sizes?.[0]?.id || '');
            setSelectedExtras([]);

            // Initialize all categories as collapsed
            if (product.extras && product.extras.length > 0) {
                const categoryNames = new Set<string>();
                product.extras.forEach((extra: any) => {
                    if (extra.category) {
                        const categoryName = extra.category.translations?.find((t: any) => t.language === lang)?.name
                            || extra.category.translations?.find((t: any) => t.language === 'en')?.name
                            || 'Other';
                        categoryNames.add(categoryName);
                    } else {
                        categoryNames.add(lang === 'fa' ? 'سایر' : 'Other');
                    }
                });
                setCollapsedCategories(categoryNames);
            }
        }
    }, [product, lang]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !product || !mounted) return null;

    const basePrice = product.price || 0;
    const sizePrice = product.sizes?.find((s: any) => s.id === selectedSize)?.priceModifier || 0;
    const extrasPrice = selectedExtras.reduce((sum, extraId) => {
        const extra = product.extras?.find((e: any) => e.id === extraId);
        return sum + (extra?.price || 0);
    }, 0);
    const totalPrice = basePrice + sizePrice + extrasPrice;

    const toggleExtra = (id: string) => {
        setSelectedExtras(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const handleAddToCart = () => {
        const sizeObj = product.sizes?.find((s: any) => s.id === selectedSize);
        const extrasObjs = product.extras?.filter((e: any) => selectedExtras.includes(e.id)).map((e: any) => ({
            id: e.id,
            name: e.name,
            price: e.price
        })) || [];

        addToCart({
            productId: product.id,
            name: product.name,
            price: totalPrice,
            quantity: 1,
            sizeName: sizeObj?.name,
            extras: extrasObjs,
            image: product.image
        });

        onClose();
        router.push(`/${lang}/cart`);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const { createPortal } = require('react-dom');

    return createPortal(
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999, // Super high z-index
                padding: '1rem',
                animation: 'fadeIn 0.3s ease'
            }}
        >
            <div style={{
                background: 'linear-gradient(145deg, rgba(30,30,30,0.98) 0%, rgba(15,15,15,0.98) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 100px rgba(255,152,0,0.1)'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        transition: 'all 0.2s ease'
                    }}
                >
                    ×
                </button>

                <div className="product-modal-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px, 1fr) minmax(300px, 1.2fr)',
                    gap: '0'
                }}>
                    {/* Image Section */}
                    <div className="product-modal-image" style={{
                        height: '100%',
                        minHeight: '350px',
                        background: product.image
                            ? `url(${product.image}) center/cover`
                            : 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '24px 0 0 24px',
                        position: 'relative'
                    }}>
                        {!product.image && (
                            <span style={{ fontSize: '6rem', opacity: 0.3 }}>🍕</span>
                        )}
                        {/* Gradient overlay */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, transparent 60%, rgba(30,30,30,0.98) 100%)',
                            borderRadius: '24px 0 0 24px'
                        }} />
                    </div>

                    {/* Details Section */}
                    <div className="product-modal-content" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Title & Description */}
                        <div>
                            <h2 className="product-modal-title" style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: '0.5rem',
                                background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.8))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>{product.name}</h2>

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
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '1rem',
                                lineHeight: '1.6'
                            }}>
                                {product.description || 'A delicious choice from our kitchen.'}
                            </p>
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
                                {product.sizes && product.sizes.length > 0 && (
                                    <div>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: '#fff',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span>📏</span> {lang === 'fa' ? 'انتخاب سایز' : 'Choose Size'}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            {product.sizes.map((size: any) => (
                                                <button
                                                    key={size.id}
                                                    onClick={() => setSelectedSize(size.id)}
                                                    style={{
                                                        padding: '0.6rem 1.25rem',
                                                        border: selectedSize === size.id
                                                            ? '2px solid #ff9800'
                                                            : '1px solid rgba(255,255,255,0.15)',
                                                        background: selectedSize === size.id
                                                            ? 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,87,34,0.1))'
                                                            : 'rgba(255,255,255,0.05)',
                                                        borderRadius: '50px',
                                                        color: selectedSize === size.id ? '#ff9800' : 'rgba(255,255,255,0.7)',
                                                        fontWeight: selectedSize === size.id ? '600' : '400',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {size.name}
                                                    {size.priceModifier > 0 && (
                                                        <span style={{ opacity: 0.7, marginLeft: '0.3rem' }}>
                                                            +{size.priceModifier}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Extras Selection */}
                                {product.extras && product.extras.length > 0 && (
                                    <div>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: '#fff',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span>✨</span> {lang === 'fa' ? 'افزودنی‌ها' : 'Add Extras'}
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {(() => {
                                                // Group extras by category
                                                const grouped: { [key: string]: any[] } = {};
                                                const uncategorized: any[] = [];

                                                product.extras.forEach((extra: any) => {
                                                    if (extra.category) {
                                                        const categoryName = extra.category.translations?.find((t: any) => t.language === lang)?.name
                                                            || extra.category.translations?.find((t: any) => t.language === 'en')?.name
                                                            || 'Other';
                                                        if (!grouped[categoryName]) {
                                                            grouped[categoryName] = [];
                                                        }
                                                        grouped[categoryName].push(extra);
                                                    } else {
                                                        uncategorized.push(extra);
                                                    }
                                                });

                                                const toggleCategory = (categoryName: string) => {
                                                    setCollapsedCategories(prev => {
                                                        const newSet = new Set(prev);
                                                        if (newSet.has(categoryName)) {
                                                            newSet.delete(categoryName);
                                                        } else {
                                                            newSet.add(categoryName);
                                                        }
                                                        return newSet;
                                                    });
                                                };

                                                return (
                                                    <>
                                                        {Object.entries(grouped).map(([categoryName, extras]) => {
                                                            const isCollapsed = collapsedCategories.has(categoryName);
                                                            return (
                                                                <div key={categoryName}>
                                                                    <div
                                                                        onClick={() => toggleCategory(categoryName)}
                                                                        style={{
                                                                            fontSize: '0.9rem',
                                                                            fontWeight: '600',
                                                                            color: '#ff9800',
                                                                            marginBottom: isCollapsed ? '0' : '0.5rem',
                                                                            textTransform: 'uppercase',
                                                                            letterSpacing: '0.5px',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.5rem',
                                                                            userSelect: 'none',
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        <span style={{
                                                                            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                                            transition: 'transform 0.2s ease',
                                                                            display: 'inline-block'
                                                                        }}>▼</span>
                                                                        {categoryName}
                                                                    </div>
                                                                    {!isCollapsed && (
                                                                        <div style={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                                            gap: '0.75rem'
                                                                        }}>
                                                                            {extras.map((extra: any) => (
                                                                                <div
                                                                                    key={extra.id}
                                                                                    onClick={() => toggleExtra(extra.id)}
                                                                                    style={{
                                                                                        padding: '0.75rem',
                                                                                        border: selectedExtras.includes(extra.id)
                                                                                            ? '2px solid #ff9800'
                                                                                            : '1px solid rgba(255,255,255,0.1)',
                                                                                        background: selectedExtras.includes(extra.id)
                                                                                            ? 'linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,87,34,0.08))'
                                                                                            : 'rgba(255,255,255,0.03)',
                                                                                        borderRadius: '12px',
                                                                                        cursor: 'pointer',
                                                                                        textAlign: 'center',
                                                                                        transition: 'all 0.2s ease'
                                                                                    }}
                                                                                >
                                                                                    <div style={{
                                                                                        fontWeight: '500',
                                                                                        color: selectedExtras.includes(extra.id) ? '#ff9800' : '#fff',
                                                                                        fontSize: '0.9rem',
                                                                                        marginBottom: '0.25rem'
                                                                                    }}>{extra.name}</div>
                                                                                    <div style={{
                                                                                        fontSize: '0.8rem',
                                                                                        color: selectedExtras.includes(extra.id) ? '#ffb74d' : 'rgba(255,255,255,0.5)'
                                                                                    }}>+{extra.price} SEK</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        {uncategorized.length > 0 && (() => {
                                                            const categoryName = lang === 'fa' ? 'سایر' : 'Other';
                                                            const isCollapsed = collapsedCategories.has(categoryName);
                                                            return (
                                                                <div>
                                                                    <div
                                                                        onClick={() => toggleCategory(categoryName)}
                                                                        style={{
                                                                            fontSize: '0.9rem',
                                                                            fontWeight: '600',
                                                                            color: '#ff9800',
                                                                            marginBottom: isCollapsed ? '0' : '0.5rem',
                                                                            textTransform: 'uppercase',
                                                                            letterSpacing: '0.5px',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.5rem',
                                                                            userSelect: 'none',
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        <span style={{
                                                                            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                                            transition: 'transform 0.2s ease',
                                                                            display: 'inline-block'
                                                                        }}>▼</span>
                                                                        {categoryName}
                                                                    </div>
                                                                    {!isCollapsed && (
                                                                        <div style={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                                            gap: '0.75rem'
                                                                        }}>
                                                                            {uncategorized.map((extra: any) => (
                                                                                <div
                                                                                    key={extra.id}
                                                                                    onClick={() => toggleExtra(extra.id)}
                                                                                    style={{
                                                                                        padding: '0.75rem',
                                                                                        border: selectedExtras.includes(extra.id)
                                                                                            ? '2px solid #ff9800'
                                                                                            : '1px solid rgba(255,255,255,0.1)',
                                                                                        background: selectedExtras.includes(extra.id)
                                                                                            ? 'linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,87,34,0.08))'
                                                                                            : 'rgba(255,255,255,0.03)',
                                                                                        borderRadius: '12px',
                                                                                        cursor: 'pointer',
                                                                                        textAlign: 'center',
                                                                                        transition: 'all 0.2s ease'
                                                                                    }}
                                                                                >
                                                                                    <div style={{
                                                                                        fontWeight: '500',
                                                                                        color: selectedExtras.includes(extra.id) ? '#ff9800' : '#fff',
                                                                                        fontSize: '0.9rem',
                                                                                        marginBottom: '0.25rem'
                                                                                    }}>{extra.name}</div>
                                                                                    <div style={{
                                                                                        fontSize: '0.8rem',
                                                                                        color: selectedExtras.includes(extra.id) ? '#ffb74d' : 'rgba(255,255,255,0.5)'
                                                                                    }}>+{extra.price} SEK</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Price & Add to Cart */}
                                <div style={{
                                    marginTop: 'auto',
                                    padding: '1.25rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {lang === 'fa' ? 'قیمت نهایی' : 'Total Price'}
                                        </div>
                                        <div style={{
                                            fontSize: '1.75rem',
                                            fontWeight: '800',
                                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {totalPrice} <span style={{
                                                fontSize: '1rem',
                                                fontWeight: '500',
                                                background: 'none',
                                                WebkitTextFillColor: 'rgba(255,255,255,0.6)'
                                            }}>SEK</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        style={{
                                            padding: '1rem 2rem',
                                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                            border: 'none',
                                            borderRadius: '50px',
                                            color: '#fff',
                                            fontWeight: '700',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 8px 25px rgba(255, 152, 0, 0.35)',
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
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <ReviewList productId={product.id} lang={lang} />
                                <div style={{ marginTop: '1.5rem' }}>
                                    <ReviewForm productId={product.id} productName={product.name} lang={lang} />
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
