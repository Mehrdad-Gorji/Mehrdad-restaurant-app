import { redirect, notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OrderTimer from '@/components/order-timer';

export default async function OrderDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = await params;
    const user = await getSessionUser();

    if (!user) {
        redirect(`/${lang}/login`);
    }

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: { include: { translations: true } },
                    extras: {
                        include: {
                            extra: { include: { translations: true } }
                        }
                    }
                }
            }
        }
    });

    if (!order) {
        notFound();
    }

    // Cast to any to handle new schema fields before Prisma client regeneration
    const orderData = order as any;

    // Parse address
    let addressInfo: any = {};
    try {
        addressInfo = orderData.addressJson ? JSON.parse(orderData.addressJson as string) : {};
    } catch { }

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            position: 'relative',
            paddingTop: '2rem',
            paddingBottom: '4rem'
        }}>
            {/* Background Orbs */}
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link href={`/${lang}/dashboard/orders`} style={{
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        ← {lang === 'fa' ? 'بازگشت به سفارشات' : 'Back to Orders'}
                    </Link>
                    <h1 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                        background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        🧾 {lang === 'fa' ? 'جزئیات سفارش' : 'Order Details'}
                    </h1>
                </div>

                {/* Order Info Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                {lang === 'fa' ? 'شماره سفارش' : 'Order ID'}
                            </div>
                            <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>
                                #{orderData.id.slice(0, 8)}
                            </div>
                        </div>
                        <span style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '50px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: orderData.status === 'COMPLETED' ? 'rgba(76,175,80,0.2)' :
                                orderData.status === 'CANCELLED' ? 'rgba(244,67,54,0.2)' :
                                    'rgba(255,152,0,0.2)',
                            color: orderData.status === 'COMPLETED' ? '#4caf50' :
                                orderData.status === 'CANCELLED' ? '#f44336' :
                                    '#ff9800'
                        }}>
                            {orderData.status}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                📅 {lang === 'fa' ? 'تاریخ' : 'Date'}
                            </div>
                            <div style={{ color: '#fff' }}>
                                {new Date(orderData.createdAt).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                🚚 {lang === 'fa' ? 'نوع تحویل' : 'Delivery'}
                            </div>
                            <div style={{ color: '#fff' }}>
                                {orderData.deliveryMethod === 'DELIVERY' ? '🛵 Delivery' :
                                    orderData.deliveryMethod === 'PICKUP' ? '🏃 Pickup' : '🍽️ Dine-in'}
                            </div>
                        </div>
                        {orderData.deliveryMethod === 'DELIVERY' && addressInfo.street && (
                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    📍 {lang === 'fa' ? 'آدرس' : 'Address'}
                                </div>
                                <div style={{ color: '#fff' }}>
                                    {addressInfo.street}, {addressInfo.city} {addressInfo.zip || addressInfo.zipCode}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dynamic Order Timer with Live Countdown */}
                <OrderTimer orderId={id} lang={lang} />

                {/* Order Items */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontWeight: '700'
                    }}>
                        🛒 {lang === 'fa' ? 'آیتم‌های سفارش' : 'Order Items'}
                    </div>

                    {orderData.items.map((item: any, index: number) => {
                        const productName = item.product?.translations?.find((t: any) => t.language === lang)?.name ||
                            item.product?.translations?.[0]?.name || 'Product';

                        return (
                            <div key={item.id} style={{
                                padding: '1.25rem 1.5rem',
                                borderBottom: index < orderData.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '1rem'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        color: '#fff',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{
                                            background: 'rgba(255,152,0,0.2)',
                                            color: '#ff9800',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '700'
                                        }}>
                                            {item.quantity}x
                                        </span>
                                        {productName}
                                    </div>

                                    {/* Extras */}
                                    {item.extras && item.extras.length > 0 && (
                                        <div style={{
                                            color: 'rgba(255,255,255,0.5)',
                                            fontSize: '0.85rem',
                                            paddingLeft: '0.5rem'
                                        }}>
                                            + {item.extras.map((e: any) => {
                                                const extraName = e.extra?.translations?.find((t: any) => t.language === lang)?.name ||
                                                    e.extra?.translations?.[0]?.name || 'Extra';
                                                return extraName;
                                            }).join(', ')}
                                        </div>
                                    )}

                                    {/* Note */}
                                    {item.note && (
                                        <div style={{
                                            color: 'rgba(255,255,255,0.4)',
                                            fontSize: '0.85rem',
                                            fontStyle: 'italic',
                                            marginTop: '0.35rem'
                                        }}>
                                            📝 {item.note}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    color: '#fff',
                                    fontWeight: '700',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {Number(item.price)} SEK
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Totals */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {lang === 'fa' ? 'جمع آیتم‌ها' : 'Subtotal'}
                        </span>
                        <span style={{ color: '#fff' }}>{Number(orderData.total)} SEK</span>
                    </div>

                    {Number(orderData.deliveryFee) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                {lang === 'fa' ? 'هزینه ارسال' : 'Delivery Fee'}
                            </span>
                            <span style={{ color: '#fff' }}>{Number(orderData.deliveryFee)} SEK</span>
                        </div>
                    )}

                    {orderData.discount && Number(orderData.discount) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                {lang === 'fa' ? 'تخفیف' : 'Discount'}
                            </span>
                            <span style={{ color: '#4caf50' }}>-{Number(orderData.discount)} SEK</span>
                        </div>
                    )}

                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>
                            {lang === 'fa' ? 'مجموع کل' : 'Total'}
                        </span>
                        <span style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {Number(orderData.total)} SEK
                        </span>
                    </div>
                </div>

                {/* Customer Info */}
                {(addressInfo.name || addressInfo.phone) && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        marginTop: '1.5rem'
                    }}>
                        <div style={{ color: '#fff', fontWeight: '700', marginBottom: '1rem' }}>
                            👤 {lang === 'fa' ? 'اطلاعات مشتری' : 'Customer Info'}
                        </div>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {addressInfo.name && (
                                <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Name: </span>
                                    {addressInfo.name}
                                </div>
                            )}
                            {addressInfo.phone && (
                                <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Phone: </span>
                                    {addressInfo.phone}
                                </div>
                            )}
                            {addressInfo.email && (
                                <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Email: </span>
                                    {addressInfo.email}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
