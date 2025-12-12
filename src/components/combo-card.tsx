'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import ComboSmartImage from './combo-smart-image';
import ComboDetailModal from './combo-detail-modal';

interface ComboTranslation {
    language: string;
    name: string;
    description?: string | null;
}

interface Props {
    combo: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        price: number;
        discountType?: string | null;
        discountValue?: number | null;
        image?: string | null;
        items: any[];
        translations?: ComboTranslation[];
    };
    lang: string;
}

export default function ComboCard({ combo, lang }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get translated name/description based on language
    const translation = combo.translations?.find(t => t.language === lang);
    const displayName = translation?.name || combo.name;
    const displayDescription = translation?.description || combo.description;

    // Calculate final price for display
    let finalPrice = combo.price;
    if (combo.discountType && combo.discountValue) {
        if (combo.discountType === 'PERCENTAGE') {
            finalPrice = combo.price * (1 - (combo.discountValue / 100));
        } else {
            finalPrice = combo.price - combo.discountValue;
        }
        finalPrice = Math.max(0, finalPrice);
    }

    return (
        <>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: '2px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '24px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
            }} className="product-card">
                {/* DEAL Badge */}
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                    color: 'white',
                    padding: '0.35rem 1rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    zIndex: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)'
                }}>
                    DEAL
                </div>

                {/* Image Area - Clickable */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        cursor: 'pointer',
                        height: '240px',
                        background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <ComboSmartImage image={combo.image} items={combo.items} />
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
                        >{displayName}</h3>
                        <p style={{
                            fontSize: '0.95rem',
                            color: 'rgba(255,255,255,0.5)',
                            marginBottom: '1rem',
                            lineHeight: '1.5',
                            maxHeight: 'calc(1.5em * 4)',
                            overflowY: 'auto'
                        }}>
                            {displayDescription || (lang === 'fa' ? 'پیشنهاد ویژه بسته!' : lang === 'sv' ? 'Specialpaket!' : lang === 'de' ? 'Sonderangebot!' : 'Special bundle offer!')}
                        </p>

                        <ul style={{
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.6)',
                            paddingLeft: '1.2rem',
                            marginBottom: '1rem'
                        }}>
                            {combo.items.map((item: any, idx: number) => (
                                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                                    {item.quantity}x {item.productName}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {/* If there's a discount, show original price with strikethrough */}
                            {combo.discountValue && combo.discountValue > 0 && (
                                <span style={{
                                    fontSize: '0.9rem',
                                    color: 'rgba(255,255,255,0.4)',
                                    textDecoration: 'line-through'
                                }}>
                                    {Math.round(combo.price)} SEK
                                </span>
                            )}
                            {/* Final price - bold if discounted */}
                            <span style={{
                                fontSize: '1.35rem',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {Math.round(finalPrice)} SEK
                            </span>
                        </div>

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
            </div>

            {/* Combo Detail Modal */}
            <ComboDetailModal
                combo={combo}
                lang={lang}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
