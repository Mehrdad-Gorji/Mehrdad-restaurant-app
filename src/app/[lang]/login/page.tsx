'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
    const router = useRouter();
    const [lang, setLang] = useState('en');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });

    // Get lang from params
    useState(() => {
        params.then(p => setLang(p.lang));
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                return;
            }

            // Redirect to dashboard
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
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
                bottom: '-100px',
                left: '-100px',
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
                maxWidth: '420px',
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
                        {lang === 'fa' ? 'ورود به حساب' : 'Welcome Back'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                        {lang === 'fa' ? 'وارد حساب کاربری خود شوید' : 'Sign in to your account'}
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                            🔒 {lang === 'fa' ? 'رمز عبور' : 'Password'}
                        </label>
                        <input
                            type="password"
                            required
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="dark-input"
                            placeholder="••••••••"
                            style={{ width: '100%' }}
                        />
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
                        {loading ? '...' : (lang === 'fa' ? 'ورود' : 'Sign In')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        {lang === 'fa' ? 'حساب ندارید؟' : "Don't have an account?"}{' '}
                        <Link href={`/${lang}/register`} style={{
                            color: '#ff9800',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            {lang === 'fa' ? 'ثبت نام' : 'Sign Up'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
