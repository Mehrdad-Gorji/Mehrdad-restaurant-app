'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import ComboSmartImage from './combo-smart-image';

interface ComboDetailModalProps {
    combo: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        price: number;
        discountType?: string | null;
        discountValue?: number | null;
        image?: string | null;
        items: {
            quantity: number;
            productName: string;
            image?: string | null;
        }[];
    };
    lang: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ComboDetailModal({ combo, lang, isOpen, onClose }: ComboDetailModalProps) {
    const { addToCart } = useCart();
    const router = useRouter();

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

    if (!isOpen || !combo || !mounted) return null;

    // Calculate final price
    let finalPrice = combo.price;
    if (combo.discountType && combo.discountValue) {
        if (combo.discountType === 'PERCENTAGE') {
            finalPrice = combo.price * (1 - (combo.discountValue / 100));
        } else {
            finalPrice = combo.price - combo.discountValue;
        }
        finalPrice = Math.max(0, finalPrice);
    }

    const handleAddToCart = () => {
        addToCart({
            productId: combo.id,
            name: combo.name,
            price: Math.round(finalPrice),
            quantity: 1,
            image: combo.image || undefined,
            isCombo: true
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
                zIndex: 9999, // High z-index
                padding: '1rem',
                animation: 'fadeIn 0.3s ease'
            }}
        >
            <div style={{
                background: 'linear-gradient(145deg, rgba(30,30,30,0.98) 0%, rgba(15,15,15,0.98) 100%)',
                border: '2px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '24px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 100px rgba(255,152,0,0.15)'
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

                {/* DEAL Badge */}
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                    color: 'white',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    zIndex: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)'
                }}>
                    🔥 DEAL
                </div>

                <div className="product-modal-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(250px, 1fr) minmax(300px, 1.2fr)',
                    gap: '0'
                }}>
                    {/* Image Section */}
                    <div className="product-modal-image" style={{
                        height: '100%',
                        minHeight: '350px',
                        background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '24px 0 0 24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <ComboSmartImage image={combo.image} items={combo.items} />
                        {/* Gradient overlay */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, transparent 60%, rgba(30,30,30,0.98) 100%)',
                            borderRadius: '24px 0 0 24px'
                        }} />
                    </div>

                    {/* Details Section */}
                    <div className="product-modal-content" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                            }}>{combo.name}</h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '1rem',
                                lineHeight: '1.6'
                            }}>
                                {combo.description || 'Special bundle offer!'}
                            </p>
                        </div>

                        {/* Package Includes */}
                        <div>
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#fff',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <span>📦</span> {lang === 'fa' ? 'محتویات پکیج' : 'Package Includes'}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {combo.items.map((item, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.06)'
                                    }}>
                                        <div style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '10px',
                                            background: item.image
                                                ? `url(${item.image.startsWith('http') ? item.image : `/api/uploads/${item.image}`}) center/cover`
                                                : 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {!item.image && <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>🍕</span>}
                                        </div>
                                        <div>
                                            <span style={{
                                                fontWeight: '600',
                                                color: '#ff9800',
                                                marginRight: '0.5rem'
                                            }}>{item.quantity}x</span>
                                            <span style={{ color: '#fff' }}>{item.productName}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price & Add to Cart */}
                        <div style={{
                            marginTop: 'auto',
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, rgba(255,152,0,0.1), rgba(255,87,34,0.05))',
                            border: '1px solid rgba(255,152,0,0.2)',
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
                                    {lang === 'fa' ? 'قیمت پکیج' : 'Deal Price'}
                                </div>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '800',
                                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {Math.round(finalPrice)} <span style={{
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
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
