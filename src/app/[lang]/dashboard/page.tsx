import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OrderTimeDisplay from '@/components/order-time-display';

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const user = await getSessionUser();

    if (!user) {
        redirect(`/${lang}/login`);
    }

    // Fetch user data
    const [orders, wallet, addresses, messages, potentialCoupons] = await Promise.all([
        prisma.order.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    { addressJson: { contains: user.email } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        }),
        prisma.wallet.findUnique({ where: { userId: user.id } }),
        prisma.address.findMany({ where: { userId: user.id } }),
        prisma.contactMessage.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    { email: user.email }
                ]
            }
        }),
        prisma.coupon.findMany({
            where: {
                isActive: true,
                allowedUsers: { some: { id: user.id } },
                OR: [{ endDate: null }, { endDate: { gte: new Date() } }]
            }
        })
    ]);

    // Calculate valid coupons count
    let validCouponsCount = 0;
    for (const coupon of potentialCoupons) {
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) continue;

        let isValid = true;
        if (coupon.maxUsesPerUser) {
            const userUses = await prisma.order.count({
                where: { userId: user.id, couponCode: coupon.code }
            });
            if (userUses >= coupon.maxUsesPerUser) isValid = false;
        }

        if (isValid) validCouponsCount++;
    }

    const menuItems = [
        { icon: '📦', label: lang === 'fa' ? 'سفارشات' : 'Orders', href: `/${lang}/dashboard/orders`, count: orders.length },
        { icon: '🏅', label: lang === 'fa' ? 'باشگاه مشتریان' : 'My Club', href: `/${lang}/dashboard/wallet`, count: wallet?.balance ? Math.floor(Number(wallet.balance)) : 0 },
        { icon: '✉️', label: lang === 'fa' ? 'پیام‌ها' : 'Messages', href: `/${lang}/dashboard/messages`, count: messages.length },
        { icon: '🎟️', label: lang === 'fa' ? 'کوپن‌ها' : 'Coupons', href: `/${lang}/dashboard/coupons`, count: validCouponsCount },
        { icon: '📍', label: lang === 'fa' ? 'آدرس‌ها' : 'Addresses', href: `/${lang}/dashboard/addresses`, count: addresses.length },
        { icon: '👤', label: lang === 'fa' ? 'پروفایل' : 'Profile', href: `/${lang}/dashboard/profile`, count: null },
    ];

    return (
        <div style={{
            position: 'relative',
            paddingBottom: '4rem'
        }}>
            {/* Background Orbs */}
            <div style={{
                position: 'fixed',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
                bottom: '0',
                left: '-100px',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Welcome Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800',
                        marginBottom: '0.5rem'
                    }}>
                        👋 {lang === 'fa' ? `سلام، ${user.name || 'کاربر'}` : `Hello, ${user.name || 'User'}`}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {lang === 'fa' ? 'به داشبورد خود خوش آمدید' : 'Welcome to your dashboard'}
                    </p>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    {/* Wallet Balance */}
                    <Link href={`/${lang}/dashboard/wallet`} style={{ textDecoration: 'none', display: 'block' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255,152,0,0.1), rgba(255,87,34,0.05))',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,152,0,0.2)',
                            borderRadius: '24px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }} className="hover-scale">
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                💰 {lang === 'fa' ? 'موجودی کیف پول' : 'Wallet Balance'}
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {wallet ? Number(wallet.balance) : 0} <span style={{ fontSize: '1rem' }}>SEK</span>
                            </div>
                        </div>
                    </Link>

                    {/* Total Orders */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '1.5rem'
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            📦 {lang === 'fa' ? 'کل سفارشات' : 'Total Orders'}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>
                            {orders.length}
                        </div>
                    </div>

                    {/* Addresses */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '1.5rem'
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            📍 {lang === 'fa' ? 'آدرس‌های ذخیره شده' : 'Saved Addresses'}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>
                            {addresses.length}
                        </div>
                    </div>
                </div>

                {/* Quick Menu */}
                <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '700' }}>
                    {lang === 'fa' ? 'دسترسی سریع' : 'Quick Access'}
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '3rem'
                }}>
                    {menuItems.map((item, i) => (
                        <Link key={i} href={item.href} style={{
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s ease'
                        }}>
                            <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                            <span style={{ color: '#fff', fontWeight: '600' }}>{item.label}</span>
                            {item.count !== null && (
                                <span style={{
                                    background: 'rgba(255,152,0,0.2)',
                                    color: '#ff9800',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '50px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>{item.count}</span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Recent Orders */}
                {orders.length > 0 && (
                    <>
                        <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '700' }}>
                            {lang === 'fa' ? 'سفارشات اخیر' : 'Recent Orders'}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.slice(0, 3).map((order: any) => (
                                <div key={order.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ color: '#fff', fontWeight: '600', marginTop: '0.25rem' }}>
                                            {lang === 'fa' ? 'سفارش' : 'Order'} #{order.id.slice(0, 8)}
                                        </div>
                                    </div>
                                    {/* Time Badge - Large and Centered */}
                                    <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                                        <OrderTimeDisplay orderId={order.id} lang={lang} initialStatus={order.status} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '50px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            background: order.status === 'COMPLETED' ? 'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)',
                                            color: order.status === 'COMPLETED' ? '#4caf50' : '#ff9800'
                                        }}>
                                            {order.status}
                                        </span>
                                        <span style={{
                                            fontWeight: '700',
                                            color: '#ff9800'
                                        }}>
                                            {Number(order.total)} SEK
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
