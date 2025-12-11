'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
    const router = useRouter();
    const [lang, setLang] = useState('en');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [form, setForm] = useState({ name: '', phone: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        params.then(p => setLang(p.lang));

        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.user) {
                    router.push(`/${lang}/login`);
                    return;
                }
                setUser(data.user);
                setForm({ name: data.user.name || '', phone: data.user.phone || '' });
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: lang === 'fa' ? 'پروفایل به‌روز شد' : 'Profile updated' });
            } else {
                setMessage({ type: 'error', text: lang === 'fa' ? 'خطا در به‌روزرسانی' : 'Update failed' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push(`/${lang}`);
        router.refresh();
    };

    if (loading) {
        return (
            <div style={{
                background: '#0a0a0a',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
            }}>
                Loading...
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
            {/* Background Orbs */}
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
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
                        👤 {lang === 'fa' ? 'پروفایل من' : 'My Profile'}
                    </h1>
                </div>

                {/* Profile Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '2rem'
                }}>
                    {/* Avatar */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            margin: '0 auto 1rem'
                        }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                            {user?.email}
                        </div>
                    </div>

                    {message.text && (
                        <div style={{
                            background: message.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(255,100,100,0.1)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(76,175,80,0.3)' : 'rgba(255,100,100,0.3)'}`,
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            color: message.type === 'success' ? '#4caf50' : '#ff6b6b',
                            textAlign: 'center'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                👤 {lang === 'fa' ? 'نام کامل' : 'Full Name'}
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="dark-input"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                📱 {lang === 'fa' ? 'شماره تلفن' : 'Phone Number'}
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="dark-input"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                marginTop: '0.5rem',
                                background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                border: 'none',
                                borderRadius: '16px',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? '...' : (lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes')}
                        </button>
                    </form>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginTop: '1rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,100,100,0.3)',
                            borderRadius: '16px',
                            color: '#ff6b6b',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {lang === 'fa' ? 'خروج از حساب' : 'Sign Out'}
                    </button>
                </div>
            </div>
        </div>
    );
}
