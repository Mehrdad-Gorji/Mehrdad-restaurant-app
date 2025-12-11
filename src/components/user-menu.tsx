'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
    lang: string;
}

export default function UserMenu({ lang }: Props) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                setUser(data.user);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        setDropdownOpen(false);
        router.refresh();
    };

    if (loading) {
        return (
            <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                animation: 'pulse 1.5s infinite'
            }} />
        );
    }

    if (!user) {
        return (
            <Link href={`/${lang}/login`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '50px',
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'all 0.3s ease'
            }}>
                <span>👤</span>
                <span>{lang === 'fa' ? 'ورود' : lang === 'sv' ? 'Logga in' : lang === 'de' ? 'Anmelden' : 'Login'}</span>
            </Link>
        );
    }

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 1rem 0.5rem 0.5rem',
                    background: 'linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,87,34,0.1))',
                    border: '1px solid rgba(255,152,0,0.3)',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                {/* Avatar */}
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#fff'
                }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>
                    {user.name || 'User'}
                </span>
                <span style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: 'rgba(20, 20, 20, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '0.5rem',
                    minWidth: '200px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 1000
                }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ color: '#fff', fontWeight: '600' }}>{user.name || 'User'}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{user.email}</div>
                    </div>

                    <Link href={`/${lang}/dashboard`} onClick={() => setDropdownOpen(false)} style={menuItemStyle}>
                        📊 {lang === 'fa' ? 'داشبورد' : 'Dashboard'}
                    </Link>
                    <Link href={`/${lang}/dashboard/orders`} onClick={() => setDropdownOpen(false)} style={menuItemStyle}>
                        📦 {lang === 'fa' ? 'سفارشات' : 'My Orders'}
                    </Link>
                    <Link href={`/${lang}/dashboard/coupons`} onClick={() => setDropdownOpen(false)} style={menuItemStyle}>
                        🎟️ {lang === 'fa' ? 'کوپن‌ها' : 'Coupons'}
                    </Link>
                    <Link href={`/${lang}/dashboard/profile`} onClick={() => setDropdownOpen(false)} style={menuItemStyle}>
                        👤 {lang === 'fa' ? 'پروفایل' : 'Profile'}
                    </Link>

                    {user.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} style={{
                            ...menuItemStyle,
                            background: 'rgba(147,51,234,0.1)',
                            borderRadius: '8px',
                            marginTop: '0.25rem'
                        }}>
                            ⚙️ Admin Panel
                        </Link>
                    )}

                    <button onClick={handleLogout} style={{
                        ...menuItemStyle,
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#ff6b6b',
                        marginTop: '0.25rem',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        paddingTop: '0.75rem',
                        borderRadius: 0
                    }}>
                        🚪 {lang === 'fa' ? 'خروج' : 'Sign Out'}
                    </button>
                </div>
            )}
        </div>
    );
}

const menuItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '0.75rem 1rem',
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    borderRadius: '8px',
    transition: 'background 0.2s ease'
};
