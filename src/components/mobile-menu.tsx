'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
    lang: string;
    navLinks: Array<{ label: string; labelSv?: string; labelDe?: string; labelFa?: string; url: string }>;
    dict: any;
}

export default function MobileMenu({ lang, navLinks, dict }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        const handleRouteChange = () => setIsOpen(false);
        window.addEventListener('popstate', handleRouteChange);
        return () => window.removeEventListener('popstate', handleRouteChange);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const getLabel = (link: any) => {
        if (lang === 'sv') return link.labelSv || link.label;
        if (lang === 'de') return link.labelDe || link.label;
        if (lang === 'fa') return link.labelFa || link.label;
        return link.label;
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mobile-menu-btn"
                aria-label="Toggle menu"
                style={{
                    display: 'none',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '44px',
                    height: '44px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    padding: '8px',
                    gap: '5px',
                    transition: 'all 0.3s ease',
                }}
            >
                <span style={{
                    width: '20px',
                    height: '2px',
                    background: '#fff',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none',
                }} />
                <span style={{
                    width: '20px',
                    height: '2px',
                    background: '#fff',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    opacity: isOpen ? 0 : 1,
                }} />
                <span style={{
                    width: '20px',
                    height: '2px',
                    background: '#fff',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
                }} />
            </button>

            {/* Mobile Menu Overlay */}
            <div
                className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(5px)',
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transition: 'all 0.3s ease',
                    zIndex: 998,
                }}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`mobile-menu-panel ${isOpen ? 'open' : ''}`}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: isOpen ? 0 : '-100%',
                    width: '85%',
                    maxWidth: '320px',
                    height: '100vh',
                    background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
                    transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2rem',
                    overflowY: 'auto',
                }}
            >
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        width: '40px',
                        height: '40px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    ×
                </button>

                {/* Menu Header */}
                <div style={{
                    marginBottom: '2rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                            borderRadius: '14px',
                            fontSize: '1.8rem',
                            boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
                        }}>
                            🍕
                        </span>
                        <span style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {dict?.header?.menu || 'Menu'}
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav style={{ flex: 1 }}>
                    <ul style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}>
                        {navLinks.map((link, index) => (
                            <li key={index}>
                                <Link
                                    href={`/${lang}${link.url === '/' ? '' : link.url}`}
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1rem 1.25rem',
                                        color: '#fff',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <span style={{
                                        marginRight: '1rem',
                                        fontSize: '1.3rem',
                                    }}>
                                        {link.url === '/' && '🏠'}
                                        {link.url === '/menu' && '📋'}
                                        {link.url === '/offers' && '🎁'}
                                        {link.url === '/about' && 'ℹ️'}
                                        {link.url === '/contact' && '📞'}
                                    </span>
                                    {getLabel(link)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.85rem',
                }}>
                    <p>🍕 Canaria Pizza</p>
                </div>
            </div>

            {/* CSS for responsive behavior */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                    .desktop-nav {
                        display: none !important;
                    }
                    .desktop-actions {
                        display: none !important;
                    }
                    .mobile-cart {
                        display: flex !important;
                    }
                }
                @media (max-width: 480px) {
                    .header-container {
                        height: 70px !important;
                        padding: 0 1rem !important;
                    }
                    .logo-text {
                        font-size: 1.4rem !important;
                    }
                    .logo-icon {
                        width: 38px !important;
                        height: 38px !important;
                    }
                }
            `}</style>
        </>
    );
}
