import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { serializePrisma } from '@/lib/serialize';
import OrderActions from '@/components/admin/order-actions';

type Props = { params: Promise<{ id: string }> };

export default async function OrderPage({ params }: Props) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: { include: { addresses: true } },
            items: {
                include: {
                    product: { include: { translations: true } },
                    combo: { include: { translations: true } },
                    extras: { include: { extra: { include: { translations: true } } } }
                }
            },
            payments: true
        }
    });

    if (!order) notFound();

    const settingsRaw = await prisma.siteSettings.findFirst();
    const vatSettingsRaw = await prisma.$queryRaw<any[]>`
        SELECT vatEnabled, vatNumber, vatRateStandard, vatRateReduced, vatPriceInclusive 
        FROM SiteSettings LIMIT 1
    `;
    const vatSettings = vatSettingsRaw?.[0] || {
        vatEnabled: true,
        vatNumber: '',
        vatRateStandard: 0.19,
        vatRateReduced: 0.07,
        vatPriceInclusive: true
    };
    const settings = {
        ...settingsRaw,
        vatEnabled: vatSettings.vatEnabled,
        vatNumber: vatSettings.vatNumber,
        vatRateStandard: vatSettings.vatRateStandard,
        vatRateReduced: vatSettings.vatRateReduced,
        vatPriceInclusive: vatSettings.vatPriceInclusive,
    };

    const safeOrder = serializePrisma(order);

    let addressSnapshot: any = null;
    try {
        if (safeOrder.addressJson) {
            addressSnapshot = JSON.parse(safeOrder.addressJson as string);
        }
    } catch (e) {
        addressSnapshot = null;
    }

    const itemsSubtotal = safeOrder.items.reduce((sum: number, it: any) => sum + (Number(it.price || 0) * (it.quantity || 1)), 0);
    const deliveryFee = Number(safeOrder.deliveryFee || 0);
    const tip = Number(safeOrder.tip || 0);
    const totalOrderAmount = Number(safeOrder.total || 0);
    const discountAmount = (itemsSubtotal + deliveryFee + tip) - totalOrderAmount;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' };
            case 'PAID': return { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff' };
            case 'PREPARING': return { bg: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff' };
            case 'DELIVERING': return { bg: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#fff' };
            case 'COMPLETED': return { bg: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' };
            case 'CANCELLED': return { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' };
            default: return { bg: 'rgba(255,255,255,0.1)', color: '#fff' };
        }
    };

    const statusStyle = getStatusStyle(safeOrder.status);

    return (
        <div style={{ color: '#fff' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        margin: '0',
                        background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📦 Order #{safeOrder.id.slice(0, 8)}
                    </h1>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginTop: '0.5rem'
                    }}>
                        <span style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '50px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: statusStyle.bg,
                            color: statusStyle.color
                        }}>
                            {safeOrder.status}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                            {new Date(safeOrder.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>
                <OrderActions order={safeOrder} />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.25rem'
            }}>
                {/* Customer Info Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    gridColumn: 'span 1'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.25rem'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            👤
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                {safeOrder.user?.name || addressSnapshot?.name || addressSnapshot?.fullName || 'Guest'}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                Customer Details
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', width: '20px' }}>📧</span>
                            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{safeOrder.user?.email || addressSnapshot?.email || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', width: '20px' }}>📞</span>
                            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{safeOrder.user?.phone || addressSnapshot?.phone || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', width: '20px' }}>🚚</span>
                            <span style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: '#a5b4fc',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}>
                                {safeOrder.deliveryMethod || '-'}
                            </span>
                        </div>
                        {safeOrder.couponCode && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)', width: '20px' }}>🎟️</span>
                                <span style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10b981',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}>
                                    {safeOrder.couponCode}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Delivery Address */}
                    {safeOrder.deliveryMethod === 'DELIVERY' && addressSnapshot?.street && (
                        <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.8rem',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Delivery Address
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                                {addressSnapshot.street}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                {addressSnapshot.city} {addressSnapshot.zipCode || addressSnapshot.zip}
                            </div>
                            {addressSnapshot.floor && (
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    Floor: {addressSnapshot.floor}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Payments Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.25rem'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            💳
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Payment</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                Transaction Details
                            </div>
                        </div>
                    </div>

                    {safeOrder.payments?.length > 0 ? (
                        safeOrder.payments.map((p: any) => (
                            <div key={p.id} style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Method</span>
                                    <span style={{ fontWeight: '600' }}>{p.method}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Amount</span>
                                    <span style={{
                                        fontWeight: '700',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>{p.amount?.toString()} SEK</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Status</span>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '6px',
                                        background: p.status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                        color: p.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}>{p.status}</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textAlign: 'right' }}>
                                    {new Date(p.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'rgba(255,255,255,0.4)'
                        }}>
                            No payments recorded
                        </div>
                    )}
                </div>
            </div>

            {/* Order Items Table */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                marginTop: '1.25rem',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <span style={{ fontSize: '1.25rem' }}>🍕</span>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Order Items</span>
                    <span style={{
                        marginLeft: 'auto',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '50px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        fontSize: '0.85rem'
                    }}>
                        {safeOrder.items.length} items
                    </span>
                </div>

                <div style={{ padding: '0.5rem' }}>
                    {safeOrder.items.map((it: any, idx: number) => (
                        <div key={it.id} style={{
                            padding: '1rem',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            marginBottom: '0.25rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {it.product?.translations?.[0]?.name || it.combo?.translations?.[0]?.name || it.product?.slug || 'Item'}
                                        {it.size && (
                                            <span style={{
                                                marginLeft: '0.5rem',
                                                fontSize: '0.8rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '6px',
                                                background: 'rgba(139, 92, 246, 0.15)',
                                                color: '#c4b5fd'
                                            }}>
                                                {it.size}
                                            </span>
                                        )}
                                    </div>
                                    {it.extras && it.extras.length > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem',
                                            marginTop: '0.5rem'
                                        }}>
                                            {it.extras.map((oe: any) => (
                                                <span key={oe.id} style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '6px',
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    color: '#fbbf24'
                                                }}>
                                                    + {oe.extra?.translations?.[0]?.name || oe.name} ({oe.price?.toString()} SEK)
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontWeight: '700',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {it.price?.toString()} SEK
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                        Qty: {it.quantity}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Breakdown */}
                <div style={{
                    margin: '0.5rem',
                    padding: '1.25rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{
                        fontWeight: '700',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>💰</span> Order Breakdown
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Items Subtotal</span>
                            <span>{itemsSubtotal.toFixed(2)} SEK</span>
                        </div>

                        {deliveryFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Delivery Fee</span>
                                <span>{deliveryFee.toFixed(2)} SEK</span>
                            </div>
                        )}

                        {safeOrder.couponCode && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                                <span>Coupon Discount</span>
                                <span>- {Math.abs(discountAmount).toFixed(2)} SEK</span>
                            </div>
                        )}

                        {tip > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                                <span>Driver Tip</span>
                                <span>{tip.toFixed(2)} SEK</span>
                            </div>
                        )}
                    </div>

                    {/* VAT Breakdown */}
                    {settings?.vatEnabled && (
                        <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                            <div style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.4)',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                📊 VAT Breakdown (prices incl. VAT)
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
                                    <span>Food Net</span>
                                    <span>{(itemsSubtotal / (1 + (settings?.vatRateReduced || 0.07))).toFixed(2)} SEK</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
                                    <span>Food VAT ({((settings?.vatRateReduced || 0.07) * 100).toFixed(0)}%)</span>
                                    <span>{(itemsSubtotal - itemsSubtotal / (1 + (settings?.vatRateReduced || 0.07))).toFixed(2)} SEK</span>
                                </div>

                                {deliveryFee > 0 && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
                                            <span>Delivery Net</span>
                                            <span>{(deliveryFee / (1 + (settings?.vatRateStandard || 0.19))).toFixed(2)} SEK</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
                                            <span>Delivery VAT ({((settings?.vatRateStandard || 0.19) * 100).toFixed(0)}%)</span>
                                            <span>{(deliveryFee - deliveryFee / (1 + (settings?.vatRateStandard || 0.19))).toFixed(2)} SEK</span>
                                        </div>
                                    </>
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: '#f59e0b',
                                    fontWeight: '600',
                                    marginTop: '0.5rem',
                                    paddingTop: '0.5rem',
                                    borderTop: '1px dotted rgba(255,255,255,0.1)'
                                }}>
                                    <span>Total VAT</span>
                                    <span>
                                        {(
                                            (itemsSubtotal - itemsSubtotal / (1 + (settings?.vatRateReduced || 0.07))) +
                                            (deliveryFee - deliveryFee / (1 + (settings?.vatRateStandard || 0.19)))
                                        ).toFixed(2)} SEK
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '2px solid rgba(255,255,255,0.1)',
                        fontWeight: '700',
                        fontSize: '1.25rem'
                    }}>
                        <span>Total {settings?.vatEnabled ? '(inkl. MwSt.)' : ''}</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>{totalOrderAmount.toFixed(2)} SEK</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
