'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminLogoutButton from '@/components/admin/admin-logout-button';

interface AdminLayoutClientProps {
    admin: any;
    showUsersMenu: boolean;
    children: React.ReactNode;
}

interface NavItemProps {
    href: string;
    icon: string;
    label: string;
    isActive: boolean;
    subItems?: { href: string; label: string }[];
    isExpanded?: boolean;

    onToggle?: () => void;
    badge?: number;
}

function NavItem({ href, icon, label, isActive, subItems, isExpanded, onToggle, badge }: NavItemProps) {
    const pathname = usePathname();
    const hasSubItems = subItems && subItems.length > 0;
    const isSubActive = subItems?.some(sub => pathname === sub.href);

    return (
        <div>
            <div
                onClick={hasSubItems ? onToggle : undefined}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: hasSubItems ? 'pointer' : 'default'
                }}
            >
                <Link
                    href={href}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        color: isActive || isSubActive ? '#fff' : 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: isActive ? '600' : '400',
                        background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                        boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                        transition: 'all 0.2s ease',
                        flex: 1
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                    <span>{label}</span>
                    {badge !== undefined && badge > 0 && (
                        <span style={{
                            marginLeft: 'auto',
                            background: '#EF4444',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '12px',
                            minWidth: '20px',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
                        }}>
                            {badge}
                        </span>
                    )}
                </Link>
                {hasSubItems && (
                    <span
                        onClick={onToggle}
                        style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.8rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        ▼
                    </span>
                )}
            </div>
            {hasSubItems && isExpanded && (
                <div style={{
                    marginLeft: '1rem',
                    marginTop: '0.25rem',
                    paddingLeft: '1rem',
                    borderLeft: '2px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.125rem'
                }}>
                    {subItems.map(sub => {
                        const isSubItemActive = pathname === sub.href;
                        return (
                            <Link
                                key={sub.href}
                                href={sub.href}
                                style={{
                                    display: 'block',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    color: isSubItemActive ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    background: isSubItemActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {sub.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function AdminLayoutClient({ admin, showUsersMenu, children }: AdminLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['products', 'settings']);

    const [pendingCount, setPendingCount] = useState(0);
    const [pendingMessages, setPendingMessages] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const fetchCount = async () => {
            try {
                // Add cache: 'no-store' to ensure real-time data
                const res = await fetch('/api/admin/orders/count', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setPendingCount(data.count);
                }

                const resMsg = await fetch('/api/admin/messages/count', { cache: 'no-store' });
                if (resMsg.ok) {
                    const dataMsg = await resMsg.json();
                    setPendingMessages(dataMsg.count);
                }
            } catch (error) {
                console.error('Failed to fetch counts', error);
            }
        };

        // Initial fetch
        fetchCount();

        // Poll frequently (every 10 seconds)
        const interval = setInterval(fetchCount, 10000);

        // Also refetch when tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchCount();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('adminSidebarOpen');
        if (saved !== null) {
            setSidebarOpen(JSON.parse(saved));
        }
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('adminSidebarOpen', JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [pathname, isMobile]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const navGroups = [
        {
            title: 'Main',
            items: [
                { id: 'dashboard', href: '/admin', icon: '📊', label: 'Dashboard' },
                { id: 'orders', href: '/admin/orders', icon: '📦', label: 'Orders', badge: pendingCount },
            ]
        },
        {
            title: 'Catalog',
            items: [
                {
                    id: 'products',
                    href: '/admin/products',
                    icon: '🍕',
                    label: 'Products',
                    subItems: [
                        { href: '/admin/categories', label: 'Categories' },
                        { href: '/admin/extras', label: 'Extras' },
                        { href: '/admin/extra-categories', label: 'Extra Categories' },
                        { href: '/admin/settings/sizes', label: 'Size Templates' },
                        { href: '/admin/products/combos', label: 'Combos' },
                        { href: '/admin/media', label: 'Media Library' },
                    ]
                },
                {
                    id: 'reports',
                    href: '/admin/reports/financial',
                    icon: '📈',
                    label: 'Financial Reports'
                },
            ]
        },
        {
            title: 'Marketing',
            items: [
                {
                    id: 'coupons',
                    href: '/admin/coupons',
                    icon: '🎟️',
                    label: 'Coupons',
                    subItems: [
                        { href: '/admin/offers', label: 'Offers' },
                    ]
                },
                { id: 'reviews', href: '/admin/reviews', icon: '⭐', label: 'Reviews' },
            ]
        },
        {
            title: 'Operations',
            items: [
                { id: 'delivery', href: '/admin/delivery', icon: '🚚', label: 'Delivery Zones' },
                { id: 'customers', href: '/admin/customers', icon: '👤', label: 'Customers' },
                ...(showUsersMenu ? [{ id: 'users', href: '/admin/users', icon: '🛡️', label: 'Admin Users' }] : []),
            ]
        },
        {
            title: 'Configuration',
            items: [
                {
                    id: 'settings',
                    href: '/admin/settings',
                    icon: '⚙️',
                    label: 'Settings',
                    subItems: [
                        { href: '/admin/settings/general', label: 'General' },
                        { href: '/admin/settings/payments', label: '💳 Payments' },
                        { href: '/admin/settings/sales', label: 'Sales & Tax' },
                        { href: '/admin/settings/footer', label: 'Footer' },
                        { href: '/admin/settings/navigation', label: 'Navigation' },
                        { href: '/admin/settings/schedule', label: 'Schedule' },
                        { href: '/admin/settings/qr', label: 'QR Generator' },
                        { href: '/admin/settings/themes', label: 'Themes' },
                        { href: '/admin/settings/loyalty', label: 'Loyalty Program' },
                    ]
                },
                { id: 'about', href: '/admin/about', icon: 'ℹ️', label: 'About Page' },
                { id: 'messages', href: '/admin/messages', icon: '💬', label: 'Messages', badge: pendingMessages },
            ]
        },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0f1a' }}>
            {/* Mobile Overlay */}
            {sidebarOpen && isMobile && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 15
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '280px',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100%',
                zIndex: 20,
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '4px 0 30px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 100%)'
                }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.25rem'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                            }}>
                                🍕
                            </div>
                            <h2 style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: 'white',
                                margin: 0,
                                background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Admin Panel</h2>
                        </div>
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.5)',
                            paddingLeft: '2.75rem'
                        }}>
                            {admin.name || admin.email}
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            display: isMobile ? 'flex' : 'none',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    {navGroups.map((group, idx) => (
                        <div key={group.title} style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                color: 'rgba(255,255,255,0.35)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '0.5rem',
                                paddingLeft: '1rem'
                            }}>
                                {group.title}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {group.items.map(item => (
                                    <NavItem
                                        key={item.id}
                                        href={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                        isActive={pathname === item.href}
                                        subItems={(item as any).subItems}

                                        isExpanded={expandedSections.includes(item.id)}
                                        onToggle={() => toggleSection(item.id)}
                                        badge={(item as any).badge}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <Link
                        href="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            color: 'rgba(255,255,255,0.6)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            background: 'rgba(255,255,255,0.05)',
                            marginBottom: '0.75rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>←</span>
                        <span>Back to Site</span>
                    </Link>
                    <AdminLogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: sidebarOpen && !isMobile ? '280px' : '0',
                padding: isMobile ? '1rem' : '2rem',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '100vh',
                width: '100%',
                maxWidth: '100vw',
                overflowX: 'hidden',
                background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)'
            }}>
                {/* Top Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    padding: '0.5rem 0'
                }}>
                    <button
                        onClick={toggleSidebar}
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        aria-label="Toggle sidebar"
                    >
                        ☰
                    </button>
                    <div style={{
                        flex: 1,
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.4)'
                    }}>
                        {pathname?.replace('/admin', '').replace(/\//g, ' / ').trim() || 'Dashboard'}
                    </div>
                </div>

                <div style={{
                    maxWidth: isMobile ? '100%' : '1400px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    {children}
                </div>
            </main>

            <style jsx>{`
                @media (max-width: 767px) {
                    aside {
                        width: 300px !important;
                    }
                }
                
                nav a:hover {
                    background: rgba(99, 102, 241, 0.1) !important;
                    color: #a5b4fc !important;
                }
            `}</style>
        </div>
    );
}
