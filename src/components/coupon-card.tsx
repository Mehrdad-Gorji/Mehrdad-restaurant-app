"use client";

import React from 'react';

interface CouponCardProps {
    coupon: {
        code: string;
        value: number;
        type: 'PERCENTAGE' | 'FIXED_AMOUNT';
        minAmount?: number | null;
        maxDiscount?: number | null;
        endDate?: Date | string | null;
    };
    lang: string;
    variant?: 'TICKET' | 'GLASS' | 'LUXE' | 'NEON'; // 4 Distinct Designs
}

export default function CouponCard({ coupon, lang, variant = 'TICKET' }: CouponCardProps) {
    const isFa = lang === 'fa';
    const discountDisplay = coupon.type === 'PERCENTAGE'
        ? `${Number(coupon.value)}%`
        : `${Number(coupon.value)} SEK`;

    // Common Helpers
    const copyToClipboard = () => {
        navigator.clipboard.writeText(coupon.code);
        // Could add toast here
    };

    /**
     * VARIANT 1: RETRO TICKET
     * Perforated edges, dashed dividers, tactile feel.
     */
    if (variant === 'TICKET') {
        return (
            <div
                onClick={copyToClipboard}
                className="group cursor-pointer transition-transform hover:scale-[1.02]"
                style={{
                    background: '#fff',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
                    display: 'flex',
                    flexDirection: isFa ? 'row-reverse' : 'row',
                    minHeight: '160px'
                }}
            >
                {/* Left/Right Accent Strip */}
                <div style={{
                    width: '12px',
                    background: `repeating-linear-gradient(45deg, #ff9800, #ff9800 10px, #f57c00 10px, #f57c00 20px)`
                }} />

                <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', color: '#333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.5rem', color: '#e65100' }}>{discountDisplay} OFF</span>
                        <span style={{ fontSize: '1.5rem', opacity: 0.2 }}>🎟️</span>
                    </div>

                    <div style={{
                        border: '2px dashed #ddd',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        textAlign: 'center',
                        fontWeight: '800',
                        fontSize: '1.25rem',
                        letterSpacing: '2px',
                        color: '#333',
                        marginBottom: 'auto'
                    }}>
                        {coupon.code}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        {coupon.endDate && <span>🕒 {new Date(coupon.endDate).toLocaleDateString()}</span>}
                        {coupon.minAmount && <span>💰 Min: {coupon.minAmount}</span>}
                    </div>
                </div>

                {/* Perforation Line */}
                <div style={{
                    width: '2px',
                    background: 'radial-gradient(circle, transparent 4px, #eee 5px) repeat-y',
                    backgroundSize: '20px 20px',
                    margin: '0 -1px'
                }} />
            </div>
        );
    }

    /**
     * VARIANT 2: GLASSMORPHISM
     * Blurred background, gradients, modern and sleek.
     */
    if (variant === 'GLASS') {
        return (
            <div
                onClick={copyToClipboard}
                className="group cursor-pointer transition-all hover:-translate-y-1"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Orb */}
                <div style={{
                    position: 'absolute', top: '-50px', right: '-50px',
                    width: '150px', height: '150px',
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent 70%)',
                    borderRadius: '50%', filter: 'blur(30px)'
                }} />

                <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>
                    {isFa ? 'پیشنهاد ویژه' : 'Special Offer'}
                </h3>

                <div style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    background: 'linear-gradient(to right, #fff, #fbcfe8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1.5rem',
                    lineHeight: 1
                }}>
                    {discountDisplay}
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#fff', letterSpacing: '1px' }}>{coupon.code}</span>
                    <span style={{ fontSize: '0.8rem', color: '#ff9800' }}>COPY</span>
                </div>
            </div>
        );
    }

    /**
     * VARIANT 3: LUXE GOLD
     * Black and Gold, premium feel, elegant typography.
     */
    if (variant === 'LUXE') {
        return (
            <div
                onClick={copyToClipboard}
                style={{
                    background: '#0a0a0a',
                    borderRadius: '4px',
                    padding: '2px', // Border wrapper
                    backgroundImage: 'linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
                    position: 'relative'
                }}
                className="group cursor-pointer"
            >
                <div style={{
                    background: '#111',
                    padding: '2rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{
                        color: '#bf953f',
                        borderBottom: '1px solid #bf953f',
                        paddingBottom: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.8rem',
                        letterSpacing: '4px',
                        textTransform: 'uppercase'
                    }}>
                        {isFa ? 'کارت عضویت' : 'Exclusive Access'}
                    </div>

                    <div style={{ fontSize: '2.5rem', color: '#fff', fontFamily: 'serif', marginBottom: '1rem' }}>
                        {discountDisplay}
                    </div>

                    <div style={{
                        color: '#fcf6ba',
                        fontSize: '1.2rem',
                        letterSpacing: '2px',
                        marginBottom: '1rem'
                    }}>
                        {coupon.code}
                    </div>

                    {coupon.endDate && (
                        <div style={{ color: '#666', fontSize: '0.7rem', fontStyle: 'italic' }}>
                            Valid until {new Date(coupon.endDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /**
     * VARIANT 4: NEON CYBER (Refined)
     * Dark mode optimized, glowing borders, futuristic.
     */
    return (
        <div
            onClick={copyToClipboard}
            className="group cursor-pointer"
            style={{
                background: '#121212',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(#121212, #121212), linear-gradient(135deg, #00C853, #64DD17)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: '0 0 20px rgba(76, 175, 80, 0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute', top: 0, right: 0,
                background: '#00C853',
                color: '#000',
                padding: '0.25rem 1rem',
                borderBottomLeftRadius: '15px',
                fontWeight: 'bold',
                fontSize: '0.8rem'
            }}>
                ACTIVE
            </div>

            <div style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                {isFa ? 'کد تخفیف شما' : 'Your Promo Code'}
            </div>

            <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#64DD17',
                textShadow: '0 0 10px rgba(100, 221, 23, 0.5)',
                marginBottom: '1rem'
            }}>
                {discountDisplay}
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '0.8rem',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                textAlign: 'center',
                border: '1px dashed #333'
            }}>
                {coupon.code}
            </div>
        </div>
    );
}
