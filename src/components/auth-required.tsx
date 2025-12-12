'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';

interface AuthRequiredProps {
    children: ReactNode;
    lang?: string;
    redirectUrl?: string;
}

const translations = {
    en: {
        title: 'Login Required',
        message: 'You must be registered and logged in to continue. Please create an account or login to proceed.',
        login: 'Login',
        register: 'Create Account',
        or: 'or'
    },
    sv: {
        title: 'Inloggning Krävs',
        message: 'Du måste vara registrerad och inloggad för att fortsätta. Vänligen skapa ett konto eller logga in.',
        login: 'Logga in',
        register: 'Skapa Konto',
        or: 'eller'
    },
    de: {
        title: 'Anmeldung Erforderlich',
        message: 'Sie müssen registriert und angemeldet sein, um fortzufahren. Bitte erstellen Sie ein Konto oder melden Sie sich an.',
        login: 'Anmelden',
        register: 'Konto Erstellen',
        or: 'oder'
    },
    fa: {
        title: 'ورود الزامی است',
        message: 'برای ادامه باید ثبت‌نام کرده و وارد شوید. لطفاً یک حساب کاربری بسازید یا وارد شوید.',
        login: 'ورود',
        register: 'ثبت‌نام',
        or: 'یا'
    }
};

export default function AuthRequired({ children, lang = 'en', redirectUrl }: AuthRequiredProps) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                setIsAuthenticated(!!data.user);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const t = translations[lang as keyof typeof translations] || translations.en;

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                color: 'rgba(255,255,255,0.5)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const loginUrl = `/${lang}/login?redirect=${encodeURIComponent(redirectUrl || currentPath)}`;
        const registerUrl = `/${lang}/register?redirect=${encodeURIComponent(redirectUrl || currentPath)}`;

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                padding: '2rem',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'
            }}>
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '3rem',
                    textAlign: 'center'
                }}>
                    {/* Icon */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 10px 40px rgba(255, 107, 107, 0.3)'
                    }}>
                        🔐
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        color: '#fff',
                        marginBottom: '1rem'
                    }}>
                        {t.title}
                    </h1>

                    {/* Message */}
                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: '1.7',
                        marginBottom: '2rem'
                    }}>
                        {t.message}
                    </p>

                    {/* Buttons */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <Link
                            href={registerUrl}
                            style={{
                                display: 'block',
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1.1rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                textAlign: 'center',
                                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t.register}
                        </Link>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            color: 'rgba(255,255,255,0.4)'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            <span>{t.or}</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        </div>

                        <Link
                            href={loginUrl}
                            style={{
                                display: 'block',
                                padding: '1rem 2rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '1rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t.login}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
