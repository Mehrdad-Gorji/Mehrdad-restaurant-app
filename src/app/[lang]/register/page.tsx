'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
    const router = useRouter();
    const [lang, setLang] = useState('en');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', street: '', city: '', zipCode: '' });

    useState(() => {
        params.then(p => setLang(p.lang));
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (form.password !== form.confirmPassword) {
            setError(lang === 'fa' ? 'رمز عبور مطابقت ندارد' : 'Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                    street: form.street,
                    city: form.city,
                    zipCode: form.zipCode
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            router.push(`/${lang}/dashboard`);
            router.refresh();
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative'
        }}>
            {/* Background Orbs */}
            <div style={{
                position: 'fixed',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.1) 0%, transparent 70%)',
                top: '-200px',
                left: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
                bottom: '-100px',
                right: '-100px',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '32px',
                padding: '3rem',
                width: '100%',
                maxWidth: '450px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '3rem' }}>🍕</span>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: '#fff',
                        marginTop: '1rem'
                    }}>
                        {lang === 'fa' ? 'ساخت حساب کاربری' : 'Create Account'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                        {lang === 'fa' ? 'به خانواده ما بپیوندید' : 'Join us for delicious food'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255,100,100,0.1)',
                        border: '1px solid rgba(255,100,100,0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#ff6b6b',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            👤 {lang === 'fa' ? 'نام کامل' : 'Full Name'}
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="dark-input"
                            placeholder={lang === 'fa' ? 'نام شما' : 'Your name'}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            📧 {lang === 'fa' ? 'ایمیل' : 'Email'}
                        </label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="dark-input"
                            placeholder="you@example.com"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            📱 {lang === 'fa' ? 'شماره موبایل' : 'Phone'}
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="dark-input"
                            placeholder="+46 ..."
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                🔒 {lang === 'fa' ? 'رمز عبور' : 'Password'}
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="dark-input"
                                placeholder="••••••"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                🔒 {lang === 'fa' ? 'تکرار رمز' : 'Confirm'}
                            </label>
                            <input
                                type="password"
                                required
                                value={form.confirmPassword}
                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                className="dark-input"
                                placeholder="••••••"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            📍 {lang === 'fa' ? 'آدرس' : 'Address'}
                        </label>
                        <input
                            type="text"
                            value={form.street}
                            onChange={e => setForm({ ...form, street: e.target.value })}
                            className="dark-input"
                            placeholder={lang === 'fa' ? 'خیابان و پلاک' : 'Street address'}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                🏙️ {lang === 'fa' ? 'شهر' : 'City'}
                            </label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={e => setForm({ ...form, city: e.target.value })}
                                className="dark-input"
                                placeholder={lang === 'fa' ? 'شهر' : 'City'}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                📮 {lang === 'fa' ? 'کد پستی' : 'Zip Code'}
                            </label>
                            <input
                                type="text"
                                value={form.zipCode}
                                onChange={e => setForm({ ...form, zipCode: e.target.value })}
                                className="dark-input"
                                placeholder={lang === 'fa' ? 'کد پستی' : 'Zip code'}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginTop: '0.5rem',
                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                            border: 'none',
                            borderRadius: '16px',
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? '...' : (lang === 'fa' ? 'ثبت نام' : 'Create Account')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        {lang === 'fa' ? 'حساب دارید؟' : 'Already have an account?'}{' '}
                        <Link href={`/${lang}/login`} style={{
                            color: '#ff9800',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            {lang === 'fa' ? 'ورود' : 'Sign In'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
