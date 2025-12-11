'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Offer {
    id: string;
    title: string;
    description: string;
    image?: string | null;
    discountCode?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
}

interface FeaturedOffersProps {
    offers: Offer[];
    lang: string;
    dict: any;
}

export default function FeaturedOffers({ offers, lang, dict }: FeaturedOffersProps) {
    if (!offers || offers.length === 0) return null;

    return (
        <section style={{
            padding: '8rem 0',
            background: '#0a0a0a',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Gradient Orbs */}
            <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 70%)',
                top: '-150px',
                left: '-100px',
                filter: 'blur(60px)',
                animation: 'float 8s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(255, 142, 83, 0.25) 0%, transparent 70%)',
                bottom: '-100px',
                right: '-50px',
                filter: 'blur(60px)',
                animation: 'float 10s ease-in-out infinite reverse'
            }} />
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(80px)',
                animation: 'pulse 6s ease-in-out infinite'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 83, 0.2))',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '50px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '1.5rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            background: '#FF6B6B',
                            borderRadius: '50%',
                            animation: 'pulse 2s ease-in-out infinite'
                        }} />
                        {dict?.home?.offers?.badge || 'Limited Time Deals'}
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: '800',
                        margin: '0 0 1.5rem',
                        background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px'
                    }}>

                        {dict?.home?.offers?.title || 'Save Big Today'}
                    </h2>

                    <p style={{
                        fontSize: '1.2rem',
                        color: 'rgba(255,255,255,0.6)',
                        maxWidth: '500px',
                        margin: '0 auto',
                        lineHeight: '1.7'
                    }}>

                        {dict?.home?.offers?.subtitle || 'Discover our latest offers and enjoy amazing discounts on your favorites.'}
                    </p>
                </div>

                {/* Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {offers.map((offer, index) => (
                        <div
                            key={offer.id}
                            className="offer-card"
                            style={{
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                                borderRadius: '28px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(20px)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative'
                            }}
                        >
                            {/* Hover Glow Effect */}
                            <div className="card-glow" style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 142, 83, 0.05))',
                                opacity: 0,
                                transition: 'opacity 0.4s ease',
                                pointerEvents: 'none'
                            }} />

                            {/* Image Section */}
                            <div style={{
                                position: 'relative',
                                height: '200px',
                                overflow: 'hidden',
                                background: 'linear-gradient(180deg, rgba(255,107,107,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                            }}>
                                {offer.image ? (
                                    <img
                                        src={offer.image.startsWith('http') || offer.image.startsWith('/') ? offer.image : `/api/uploads/${offer.image}`}
                                        alt={offer.title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                            filter: 'brightness(0.9)'
                                        }}
                                        className="offer-img"
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '4rem'
                                    }}>
                                        🍕
                                    </div>
                                )}

                                {/* Discount Badge */}
                                {offer.discountCode && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                        color: 'white',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '12px',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 8px 20px rgba(255, 107, 107, 0.4)',
                                        border: '1px solid rgba(255,255,255,0.2)'
                                    }}>
                                        {offer.discountCode}
                                    </div>
                                )}

                                {/* Gradient Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '80px',
                                    background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, transparent 100%)',
                                    pointerEvents: 'none'
                                }} />
                            </div>

                            {/* Content Section */}
                            <div style={{
                                padding: '1.5rem 2rem 2rem',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <h3 style={{
                                    fontSize: '1.4rem',
                                    fontWeight: '700',
                                    marginBottom: '0.75rem',
                                    lineHeight: 1.3,
                                    color: '#fff'
                                }}>
                                    {offer.title}
                                </h3>

                                <p style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: '1.5rem',
                                    lineHeight: 1.6,
                                    fontSize: '0.95rem'
                                }}>
                                    {offer.description || 'Limited time offer. Don\'t miss out!'}
                                </p>

                                {offer.discountCode ? (
                                    <CopyCodeButton
                                        code={offer.discountCode}
                                        label={dict?.home?.offers?.copyCode || 'Copy Code'}
                                        copiedLabel={dict?.home?.offers?.copied || 'Copied!'}
                                    />
                                ) : (
                                    <Link href={`/${lang}/menu`} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%',
                                        padding: '1rem 1.5rem',
                                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                        color: 'white',
                                        borderRadius: '14px',
                                        fontWeight: '700',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                                    }}>
                                        {dict?.home?.offers?.orderNow || 'Order Now'}
                                        <span>→</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Link */}
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Link href={`/${lang}/offers`} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem 2rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '50px',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1rem',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                    }} className="view-all-btn">
                        {dict?.home?.offers?.viewAll || 'View All Offers'}
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                            borderRadius: '50%',
                            fontSize: '0.9rem'
                        }}>→</span>
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                .offer-card:hover {
                    transform: translateY(-8px) scale(1.02) !important;
                    border-color: rgba(255, 107, 107, 0.3) !important;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 40px rgba(255, 107, 107, 0.1) !important;
                }
                .offer-card:hover .card-glow {
                    opacity: 1 !important;
                }
                .offer-card:hover .offer-img {
                    transform: scale(1.1);
                }
                .view-all-btn:hover {
                    background: rgba(255,255,255,0.1) !important;
                    border-color: rgba(255,255,255,0.3) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </section>
    );
}

function CopyCodeButton({ code, label, copiedLabel }: { code: string, label: string, copiedLabel: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="copy-btn"
            style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: copied
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
                    : 'linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 142, 83, 0.1))',
                border: copied
                    ? '1px solid rgba(34, 197, 94, 0.4)'
                    : '1px solid rgba(255, 107, 107, 0.3)',
                color: copied ? '#22C55E' : '#FF6B6B',
                borderRadius: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                backdropFilter: 'blur(10px)'
            }}
        >
            {copied ? (
                <>
                    <span style={{ fontSize: '1.1rem' }}>✓</span> {copiedLabel}
                </>
            ) : (
                <>
                    <span style={{ fontSize: '1rem' }}>✂</span> {label}
                </>
            )}
        </button>
    );
}
