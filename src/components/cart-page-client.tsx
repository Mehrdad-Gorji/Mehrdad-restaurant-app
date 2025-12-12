'use client';

import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { calculateVAT, VATSettings, DEFAULT_VAT_SETTINGS } from "@/lib/vat";
import { isShopOpen } from "@/lib/shop-status";

export default function CartPageClient({ lang, dictionary }: { lang: string; dictionary: any }) {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const router = useRouter();

    // VAT settings
    const [vatSettings, setVatSettings] = useState<VATSettings>(DEFAULT_VAT_SETTINGS);
    const [shopStatus, setShopStatus] = useState<{ isOpen: boolean; message: string }>({ isOpen: true, message: '' });

    useEffect(() => {
        const loadVATSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setVatSettings({
                        vatEnabled: data.vatEnabled ?? true,
                        vatNumber: data.vatNumber ?? '',
                        vatRateStandard: data.vatRateStandard ?? 0.19,
                        vatRateReduced: data.vatRateReduced ?? 0.07,
                        vatPriceInclusive: data.vatPriceInclusive ?? true,
                    });

                    const status = isShopOpen(data.operatingSchedule, data.scheduleEnabled ?? false);
                    setShopStatus(status);
                }
            } catch (e) {
                console.error('Error loading VAT settings:', e);
            }
        };
        loadVATSettings();
    }, []);

    // Calculate VAT breakdown
    const vatBreakdown = vatSettings.vatEnabled
        ? calculateVAT(total, vatSettings.vatRateReduced, vatSettings.vatPriceInclusive)
        : { gross: total, net: total, vat: 0, rate: 0 };

    if (items.length === 0) {
        return (
            <div style={{
                background: '#0a0a0a',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                position: 'relative'
            }}>
                {/* Background Orbs */}
                <div style={{
                    position: 'fixed',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                    top: '-200px',
                    right: '-100px',
                    filter: 'blur(80px)',
                    pointerEvents: 'none'
                }} />

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '5rem', marginBottom: '1rem', display: 'block' }}>🛒</span>
                    <h2 style={{
                        fontSize: '2rem',
                        color: '#fff',
                        marginBottom: '1rem'
                    }}>
                        {dictionary?.cart?.emptyTitle || 'Your cart is empty'}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
                        {dictionary?.cart?.emptyMessage || 'Add some delicious items to get started!'}
                    </p>
                    <button
                        onClick={() => router.push(`/${lang}/menu`)}
                        style={{
                            padding: '1rem 2.5rem',
                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                            border: 'none',
                            borderRadius: '50px',
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)'
                        }}
                    >
                        {dictionary?.cart?.backToMenu || 'Browse Menu'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            position: 'relative',
            paddingTop: '2rem',
            paddingBottom: '4rem'
        }}>
            {/* Background Gradient Orbs */}
            <div style={{
                position: 'fixed',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none',
                zIndex: 0
            }} />
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
                bottom: '0',
                left: '-100px',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800',
                        marginBottom: '0.5rem'
                    }}>
                        🛒 {dictionary?.cart?.title || 'Shopping Cart'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {items.length} {items.length === 1 ? dictionary?.cart?.item : dictionary?.cart?.items}
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    alignItems: 'start'
                }}>
                    {/* Cart Items */}
                    <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '0' }}>
                        {items.map((item) => (
                            <div
                                key={item.uniqueId}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '20px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'center'
                                }}
                            >
                                {/* Product Image */}
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '16px',
                                    background: item.image
                                        ? `url(${item.image}) center/cover`
                                        : 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {!item.image && <span style={{ fontSize: '2rem', opacity: 0.4 }}>🍕</span>}
                                </div>

                                {/* Product Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        color: '#fff',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        marginBottom: '0.25rem'
                                    }}>{item.name}</h3>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                        {item.sizeName && <span>{item.sizeName}</span>}
                                        {item.extras && item.extras.length > 0 && (
                                            <span> + {item.extras.map(e => e.name).join(', ')}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Quantity Controls */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '50px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <button
                                        onClick={() => updateQuantity(item.uniqueId, -1)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            border: 'none',
                                            background: 'transparent',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >−</button>
                                    <span style={{
                                        padding: '0 0.75rem',
                                        color: '#fff',
                                        fontWeight: '600'
                                    }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.uniqueId, 1)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            border: 'none',
                                            background: 'transparent',
                                            color: '#fff',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >+</button>
                                </div>

                                {/* Price */}
                                <span style={{
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    minWidth: '80px',
                                    textAlign: 'right',
                                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {item.price * item.quantity} SEK
                                </span>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromCart(item.uniqueId)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: '1px solid rgba(255,100,100,0.3)',
                                        background: 'rgba(255,100,100,0.1)',
                                        color: '#ff6b6b',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div style={{
                        flex: '1 1 300px',
                        minWidth: '0',
                        background: 'linear-gradient(135deg, rgba(255,152,0,0.05), rgba(147,51,234,0.05))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '2rem',
                        position: 'sticky',
                        top: '100px'
                    }}>
                        <h3 style={{
                            color: '#fff',
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            marginBottom: '1.5rem'
                        }}>
                            {dictionary?.cart?.summary || 'Order Summary'}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            {vatSettings.vatEnabled && vatSettings.vatPriceInclusive && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                                        <span>{dictionary?.cart?.net || 'Net'}</span>
                                        <span>{vatBreakdown.net.toFixed(2)} SEK</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                                        <span>VAT ({(vatSettings.vatRateReduced * 100).toFixed(0)}%)</span>
                                        <span>{vatBreakdown.vat.toFixed(2)} SEK</span>
                                    </div>
                                </>
                            )}
                            {!vatSettings.vatEnabled && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                                    <span>{dictionary?.cart?.subtotal || 'Subtotal'}</span>
                                    <span>{total} SEK</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                                <span>{dictionary?.cart?.delivery || 'Delivery'}</span>
                                <span>{dictionary?.cart?.calcAtCheckout || 'Calculated at checkout'}</span>
                            </div>
                        </div>

                        <div style={{
                            borderTop: '2px solid rgba(255,152,0,0.3)',
                            paddingTop: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
                                    {dictionary?.cart?.total || 'Total'} {vatSettings.vatEnabled && vatSettings.vatPriceInclusive && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({dictionary?.cart?.inclVat || 'incl. VAT'})</span>}
                                </span>
                                <span style={{
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {total} SEK
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => router.push(`/${lang}/checkout`)}
                                disabled={!shopStatus.isOpen}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    background: shopStatus.isOpen ? 'linear-gradient(135deg, #ff9800, #ff5722)' : '#444',
                                    border: 'none',
                                    borderRadius: '16px',
                                    color: shopStatus.isOpen ? '#fff' : '#aaa',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: shopStatus.isOpen ? 'pointer' : 'not-allowed',
                                    boxShadow: shopStatus.isOpen ? '0 8px 25px rgba(255, 152, 0, 0.3)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {shopStatus.isOpen
                                    ? (dictionary?.cart?.proceedCheckout || 'Proceed to Checkout')
                                    : (dictionary?.cart?.storeClosed || 'Store Closed')
                                }
                            </button>
                            {!shopStatus.isOpen && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '12px',
                                    marginTop: '0.5rem',
                                    color: '#fca5a5',
                                    fontSize: '0.9rem',
                                    textAlign: 'center'
                                }}>
                                    ⚠️ {shopStatus.message}
                                </div>
                            )}
                            <button
                                onClick={clearCart}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '16px',
                                    color: 'rgba(255,255,255,0.6)',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {dictionary?.cart?.clearCart || 'Clear Cart'}
                            </button>
                        </div>

                        <button
                            onClick={() => router.push(`/${lang}/menu`)}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'transparent',
                                border: 'none',
                                color: '#ff9800',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            {dictionary?.cart?.continueShopping || 'Continue Shopping'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
