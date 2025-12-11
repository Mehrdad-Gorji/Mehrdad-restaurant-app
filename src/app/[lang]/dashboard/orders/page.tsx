import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OrderTimeDisplay, { OrderStatusBadge } from '@/components/order-time-display';

export default async function OrdersPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const user = await getSessionUser();

    if (!user) {
        redirect(`/${lang}/login`);
    }

    const orders = await prisma.order.findMany({
        where: {
            OR: [
                { userId: user.id },
                // Also match orders by email for orders placed before login
                { addressJson: { contains: user.email } }
            ]
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
    });

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

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link href={`/${lang}/dashboard`} style={{
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        ← {lang === 'fa' ? 'بازگشت به داشبورد' : 'Back to Dashboard'}
                    </Link>
                    <h1 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        📦 {lang === 'fa' ? 'سفارشات من' : 'My Orders'}
                    </h1>
                </div>

                {orders.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '4rem 2rem',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>
                            {lang === 'fa' ? 'سفارشی ندارید' : 'No orders yet'}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
                            {lang === 'fa' ? 'اولین سفارش خود را ثبت کنید' : 'Place your first order now'}
                        </p>
                        <Link href={`/${lang}/menu`} style={{
                            display: 'inline-block',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                            borderRadius: '50px',
                            color: '#fff',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}>
                            {lang === 'fa' ? 'مشاهده منو' : 'Browse Menu'}
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {orders.map((order: any) => (
                            <Link
                                key={order.id}
                                href={`/${lang}/dashboard/orders/${order.id}`}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '20px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>
                                        #{order.id.slice(0, 8)}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                        {order.items.length} {lang === 'fa' ? 'آیتم' : 'items'} • {order.deliveryMethod}
                                    </div>
                                </div>
                                {/* Time Badge - Centered */}
                                <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                                    <OrderTimeDisplay orderId={order.id} lang={lang} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <OrderStatusBadge orderId={order.id} initialStatus={order.status} />
                                    <span style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '800',
                                        background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {Number(order.total)} SEK
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem' }}>→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
