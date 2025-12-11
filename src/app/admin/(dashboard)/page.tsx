import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getAdminSession, isSuperAdmin } from '@/lib/admin-auth';

export default async function AdminDashboard() {
    const admin = await getAdminSession();
    const showAdminUsers = admin && isSuperAdmin(admin.adminRole);

    const totalOrders = await prisma.order.count();
    const productsCount = await prisma.product.count();
    const customersCount = await prisma.user.count({ where: { role: 'USER' } });
    const couponsCount = await prisma.coupon.count({ where: { isActive: true } });
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const reviewsCount = await prisma.review.count({ where: { isApproved: false } });

    // Calculate revenue
    const orders = await prisma.order.findMany({
        where: { status: 'PAID' },
        select: { total: true }
    });
    const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, total: true, status: true, createdAt: true, addressJson: true }
    });

    const statCards = [
        { icon: '📦', label: 'Total Orders', value: totalOrders, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', change: `${pendingOrders} pending` },
        { icon: '💰', label: 'Revenue', value: `${revenue.toFixed(0)} SEK`, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', change: 'Total sales' },
        { icon: '👤', label: 'Customers', value: customersCount, gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', change: 'Registered users' },
        { icon: '🍕', label: 'Products', value: productsCount, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', change: 'Active items' },
    ];

    const quickActions = [
        { href: '/admin/orders', icon: '📦', label: 'Orders', badge: pendingOrders > 0 ? pendingOrders : null, badgeColor: '#f59e0b' },
        { href: '/admin/products', icon: '🍕', label: 'Products', badge: productsCount },
        { href: '/admin/categories', icon: '📁', label: 'Categories' },
        { href: '/admin/extras', icon: '🧀', label: 'Extras' },
        { href: '/admin/products/combos', icon: '🎯', label: 'Combos' },
        { href: '/admin/coupons', icon: '🎟️', label: 'Coupons', badge: couponsCount },
        { href: '/admin/offers', icon: '🏷️', label: 'Offers' },
        { href: '/admin/delivery', icon: '🚚', label: 'Delivery' },
        { href: '/admin/reviews', icon: '⭐', label: 'Reviews', badge: reviewsCount > 0 ? reviewsCount : null, badgeColor: '#ef4444' },
        { href: '/admin/customers', icon: '👤', label: 'Customers' },
        ...(showAdminUsers ? [{ href: '/admin/users', icon: '🛡️', label: 'Admins' }] : []),
        { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
    ];

    return (
        <div style={{ color: '#fff' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Welcome back! 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                    Here's what's happening with your restaurant today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                {statCards.map((stat, idx) => (
                    <div key={idx} style={{
                        background: stat.gradient,
                        borderRadius: '20px',
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}>
                        {/* Background decoration */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '50%'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            right: '30px',
                            width: '60px',
                            height: '60px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%'
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                marginBottom: '1rem'
                            }}>
                                {stat.icon}
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: '#fff',
                                marginBottom: '0.25rem'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: '500'
                            }}>
                                {stat.label}
                            </div>
                            <div style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.6)',
                                marginTop: '0.5rem'
                            }}>
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    color: 'rgba(255,255,255,0.9)'
                }}>
                    Quick Actions
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '0.75rem'
                }}>
                    {quickActions.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '1.25rem 0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                textDecoration: 'none',
                                color: '#fff',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                        >
                            <span style={{
                                fontSize: '1.75rem',
                                marginBottom: '0.5rem',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                            }}>
                                {item.icon}
                            </span>
                            <span style={{
                                fontWeight: '500',
                                fontSize: '0.85rem',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                {item.label}
                            </span>
                            {item.badge !== undefined && item.badge !== null && (
                                <span style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: (item as any).badgeColor || 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#fff',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '10px',
                                    minWidth: '20px',
                                    textAlign: 'center'
                                }}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Orders Section */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: '#fff'
                        }}>
                            Recent Orders
                        </h2>
                        <p style={{
                            margin: '0.25rem 0 0',
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.5)'
                        }}>
                            Latest customer orders
                        </p>
                    </div>
                    <Link href="/admin/orders" style={{
                        color: '#a5b4fc',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease'
                    }}>
                        View All <span>→</span>
                    </Link>
                </div>
                <div>
                    {recentOrders.length === 0 ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.4)'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                            No orders yet
                        </div>
                    ) : (
                        recentOrders.map((order, idx) => {
                            const address = order.addressJson ? JSON.parse(order.addressJson as string) : {};
                            return (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem 1.5rem',
                                        borderBottom: idx < recentOrders.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'background 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>
                                            {(address.name || 'G')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#fff' }}>
                                                {address.name || 'Guest'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                                {new Date(order.createdAt).toLocaleDateString('de-DE', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontWeight: '700',
                                            fontSize: '1.1rem',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {Number(order.total).toFixed(0)} SEK
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '6px',
                                            background: order.status === 'PAID'
                                                ? 'rgba(16, 185, 129, 0.15)'
                                                : order.status === 'PENDING'
                                                    ? 'rgba(245, 158, 11, 0.15)'
                                                    : 'rgba(99, 102, 241, 0.15)',
                                            color: order.status === 'PAID'
                                                ? '#10b981'
                                                : order.status === 'PENDING'
                                                    ? '#f59e0b'
                                                    : '#6366f1',
                                            fontWeight: '600'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* CSS for hover effects */}
            <style>{`
                a:hover {
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
