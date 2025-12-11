"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SpecialOccasionWidgetProps {
    theme: string;
    lang: string;
    mode?: 'card' | 'banner';
    customTitle?: string;
    customSubtitle?: string;
    customButtonText?: string;
    customBadge?: string;
}

export default function SpecialOccasionWidget({
    theme,
    lang,
    mode = 'card',
    customTitle,
    customSubtitle,
    customButtonText,
    customBadge
}: SpecialOccasionWidgetProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (theme && theme !== 'NONE') {
            setIsVisible(true);
        }
    }, [theme]);

    if (!isVisible || !theme || theme === 'NONE') return null;

    const content = getThemeContent(theme, lang);
    if (!content) return null;

    const isBanner = mode === 'banner';

    // Verify if custom text is provided, otherwise fall back to theme defaults
    const displayTitle = customTitle || content.title;
    const displaySubtitle = customSubtitle || content.subtitle;
    const displayButtonText = customButtonText || (lang === 'fa' ? 'محصولات ویژه' : (content.buttonText || 'Shop Collection'));
    const displayBadge = customBadge || content.badge;

    return (
        <div className={`relative w-full overflow-hidden ${isBanner ? '' : 'rounded-3xl'}`} style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: isBanner ? '450px' : '260px',
            margin: isBanner ? '0' : '2rem 0',
            boxShadow: isBanner ? 'none' : '0 20px 40px -10px rgba(0,0,0,0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Inject Theme-Specific CSS Styles */}
            <style jsx global>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
                @keyframes snow { 0% { transform: translateY(-10vh) translateX(0); opacity: 1; } 100% { transform: translateY(100vh) translateX(20px); opacity: 0; } }
                @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.2); } 50% { box-shadow: 0 0 40px rgba(255,255,255,0.5); } }
                @keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { transform: translate(0); } }
                @keyframes shine { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
                @keyframes rotate-sun { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.1); } 30% { transform: scale(1); } 45% { transform: scale(1.1); } 60% { transform: scale(1); } }
                @keyframes firework { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
            `}</style>

            {/* Background Container */}
            <div style={{
                position: 'absolute', inset: 0,
                ...content.containerStyle
            }}>
                {content.backgroundElement}
            </div>

            {/* Content Container (Glassmorphism layer) */}
            <div style={{
                position: 'relative', zIndex: 10,
                height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '3rem 2rem',
                textAlign: 'center',
                background: content.glassEffect ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                backdropFilter: content.glassEffect ? 'blur(10px)' : 'none',
            }}>

                {/* Badge/Eyebrow */}
                {displayBadge && (
                    <span style={{
                        display: 'inline-block',
                        padding: '0.4rem 1rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        ...content.badgeStyle
                    }}>
                        {displayBadge}
                    </span>
                )}

                {/* Main Title */}
                <h2 style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    fontWeight: '900',
                    lineHeight: '1',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    ...content.titleStyle
                }}>
                    {displayTitle}
                </h2>

                {/* Subtitle */}
                <p style={{
                    fontSize: '1.2rem',
                    maxWidth: '600px',
                    margin: '0 auto 2rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    ...content.textStyle
                }}>
                    {displaySubtitle}
                </p>

                {/* CTA Button */}
                <Link href={`/${lang}/offers`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 3rem',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    ...content.buttonStyle
                }} className="hover:scale-105 active:scale-95">
                    {displayButtonText}
                </Link>
            </div>
        </div>
    );
}

function getThemeContent(theme: string, lang: string) {
    const isFa = lang === 'fa';

    switch (theme) {
        case 'BLACK_FRIDAY':
            return {
                title: 'BLACK FRIDAY',
                subtitle: isFa ? 'بزرگترین حراج سال آغاز شد. تا ۷۰٪ تخفیف روی محصولات منتخب.' : 'The biggest sale of the year is here. Up to 70% OFF on selected items.',
                badge: 'LIMITED TIME',
                buttonText: 'ACCESS DEALS',
                containerStyle: {
                    background: '#000000',
                },
                glassEffect: false,
                textStyle: { color: '#e0e0e0' },
                titleStyle: {
                    color: '#fff',
                    textShadow: '2px 0 #ff0000, -2px 0 #00ffff',
                    animation: 'glitch 3s infinite',
                    fontFamily: 'monospace' // Cyberpunk feel
                },
                badgeStyle: {
                    background: '#ff0000',
                    color: '#000',
                    boxShadow: '0 0 15px #ff0000'
                },
                buttonStyle: {
                    background: 'transparent',
                    color: '#fff',
                    border: '2px solid #fff',
                    boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                },
                backgroundElement: (
                    <>
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                            backgroundSize: '100% 2px, 3px 100%',
                            pointerEvents: 'none',
                        }} />
                        <div style={{
                            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                            background: 'radial-gradient(circle, rgba(255,0,0,0.15) 0%, transparent 60%)',
                            animation: 'rotate-sun 20s linear infinite'
                        }} />
                    </>
                )
            };

        case 'CHRISTMAS':
            return {
                title: isFa ? 'کریسمس مبارک' : 'MERRY CHRISTMAS',
                subtitle: isFa ? 'جادوی زمستان را با طعم‌های گرم و دلنشین جشن بگیرید.' : 'Celebrate the magic of the season with our festive holiday menu.',
                badge: isFa ? 'جشنواره زمستانی' : 'WINTER FESTIVAL',
                buttonText: 'SEE HOLIDAY MENU',
                containerStyle: {
                    background: 'linear-gradient(135deg, #114B2C 0%, #002e1a 100%)', // Deep elegant green
                },
                glassEffect: true,
                textStyle: { color: '#e8f5e9' },
                titleStyle: {
                    fontFamily: 'serif',
                    background: 'linear-gradient(to right, #F7D786 0%, #D4AF37 50%, #F7D786 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% auto',
                    animation: 'shine 4s linear infinite'
                },
                badgeStyle: {
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid #D4AF37',
                    color: '#D4AF37'
                },
                buttonStyle: {
                    background: '#C62828', // Christmas Red
                    color: '#fff',
                    boxShadow: '0 10px 25px rgba(198, 40, 40, 0.4)'
                },
                backgroundElement: (
                    <>
                        {/* Snow Particles */}
                        {[...Array(20)].map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                left: `${Math.random() * 100}%`,
                                top: `-10%`,
                                color: '#fff',
                                opacity: Math.random(),
                                fontSize: `${Math.random() * 1 + 0.5}rem`,
                                animation: `snow ${5 + Math.random() * 5}s linear infinite`,
                                animationDelay: `${Math.random() * 5}s`
                            }}>❄</div>
                        ))}
                    </>
                )
            };

        case 'NEW_YEAR':
            return {
                title: isFa ? 'سال ۲۰۲۶ مبارک' : 'HAPPY 2026',
                subtitle: isFa ? 'آغاز سالی نو با طعم‌های بی‌نظیر و خاطره‌انگیز.' : 'Ring in the New Year with grandeur. A fresh start deserves fresh flavors.',
                badge: 'NEW YEAR EVE',
                buttonText: 'BOOK A TABLE',
                containerStyle: {
                    background: '#0a0a0a'
                },
                glassEffect: true,
                textStyle: { color: '#bdbdbd' },
                titleStyle: {
                    fontWeight: '300',
                    letterSpacing: '10px',
                    color: '#fff'
                },
                badgeStyle: {
                    background: '#fff',
                    color: '#000'
                },
                buttonStyle: {
                    background: 'linear-gradient(45deg, #CFD8DC, #fff)',
                    color: '#000',
                    boxShadow: '0 0 20px rgba(255,255,255,0.3)'
                },
                backgroundElement: (
                    <>
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(circle at 50% 50%, #2a2a2a 0%, #000 100%)'
                        }} />
                        {/* Golden Fireworks (Simulated with radial gradients) */}
                        <div style={{
                            position: 'absolute', top: '20%', left: '20%', width: '200px', height: '200px',
                            background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
                            animation: 'pulse-glow 2s infinite'
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '20%', right: '20%', width: '150px', height: '150px',
                            background: 'radial-gradient(circle, rgba(192,192,192,0.4) 0%, transparent 70%)',
                            animation: 'pulse-glow 3s infinite', animationDelay: '1s'
                        }} />
                    </>
                )
            };

        case 'VALENTINE':
            return {
                title: isFa ? 'عشق در هر نگاه' : 'LOVE IS IN THE AIR',
                subtitle: isFa ? 'یک شام رمانتیک برای دو نفر. لحظاتی که فراموش نخواهید کرد.' : 'Treat your special someone to a romantic dinner they will never forget.',
                badge: 'ROMANTIC DINNER',
                buttonText: 'ORDER FOR TWO',
                containerStyle: {
                    background: 'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)' // Soft Peach to Lavender
                },
                glassEffect: true,
                textStyle: { color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.1)' },
                titleStyle: {
                    color: '#fff',
                    textShadow: '0 2px 10px rgba(233,30,99,0.3)',
                },
                badgeStyle: {
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.4)'
                },
                buttonStyle: {
                    background: '#fff',
                    color: '#d57eeb',
                    boxShadow: '0 10px 20px rgba(213, 126, 235, 0.3)'
                },
                backgroundElement: (
                    <>
                        {/* Floating Hearts */}
                        {[...Array(10)].map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                left: `${Math.random() * 100}%`,
                                bottom: '-10%',
                                fontSize: `${Math.random() * 2 + 1}rem`,
                                opacity: 0.6,
                                animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`
                            }}>❤</div>
                        ))}
                    </>
                )
            };

        case 'EASTER':
            return {
                title: isFa ? 'شادی‌های بهاری' : 'SPRING DELIGHTS',
                subtitle: isFa ? 'طراوت بهار در هر وعده غذایی. منوی ویژه ما را امتحان کنید.' : 'Fresh flavors, colorful dishes, and the joy of spring in every bite.',
                badge: 'SEASONAL',
                buttonText: 'VIEW MENU',
                containerStyle: {
                    background: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)' // Pastel Purple to Pink
                },
                glassEffect: false,
                textStyle: { color: '#fff' },
                titleStyle: {
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                },
                badgeStyle: {
                    background: '#fff',
                    color: '#a18cd1',
                },
                buttonStyle: {
                    background: '#8EC5FC',
                    backgroundImage: 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)',
                    color: '#fff',
                    boxShadow: '0 5px 15px rgba(161, 140, 209, 0.4)'
                },
                backgroundElement: (
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.2) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.2) 0%, transparent 20%)',
                    }} />
                )
            };

        case 'HALLOWEEN':
            return {
                title: 'TRICK OR TREAT',
                subtitle: isFa ? 'تخفیف‌های ترسناک برای شب‌های تاریک!' : 'Spooktacular savings on our most hauntingly delicious items.',
                badge: 'HALLOWEEN SPECIAL',
                buttonText: 'GRAB DEALS',
                containerStyle: {
                    background: '#1a0524', // Deep purple/black
                },
                glassEffect: false,
                textStyle: { color: '#b39ddb' },
                titleStyle: {
                    color: '#ff6d00', // Pumpkin Orange
                    fontFamily: 'fantasy',
                    letterSpacing: '3px',
                    textShadow: '0 0 10px #ff6d00'
                },
                badgeStyle: {
                    background: '#2d0c3d',
                    color: '#ff6d00',
                    border: '1px solid #4a148c'
                },
                buttonStyle: {
                    background: '#ff6d00',
                    color: '#000',
                    boxShadow: '0 0 20px rgba(255, 109, 0, 0.4)'
                },
                backgroundElement: (
                    <>
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(circle at 50% 100%, #2d0c3d 0%, #000 70%)'
                        }} />
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px',
                            background: 'linear-gradient(to top, rgba(74, 20, 140, 0.3), transparent)',
                            filter: 'blur(20px)',
                            animation: 'pulse-glow 4s infinite'
                        }} />
                        {/* Bat Shadows */}
                        <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '3rem', opacity: 0.2, transform: 'rotate(15deg)' }}>🦇</div>
                        <div style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '2rem', opacity: 0.1, transform: 'rotate(-10deg)' }}>🦇</div>
                    </>
                )
            };

        case 'SUMMER':
            return {
                title: isFa ? 'موج‌های تابستانی' : 'SUMMER WAVES',
                subtitle: isFa ? 'با نوشیدنی‌های خنک و غذاهای سبک ما خنک شوید.' : 'Beat the heat with our refreshing lineup of cool drinks and light meals.',
                badge: 'HOT & FRESH',
                buttonText: 'DIVE IN',
                containerStyle: {
                    background: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)' // Clear Blue Sky
                },
                glassEffect: false,
                textStyle: { color: '#01579b' },
                titleStyle: {
                    color: '#fff',
                    textShadow: '0 2px 0 rgba(0,0,0,0.1)',
                    fontWeight: '800'
                },
                badgeStyle: {
                    background: '#fff',
                    color: '#29b6f6'
                },
                buttonStyle: {
                    background: '#fff', // Sun yellow center
                    color: '#29b6f6',
                    boxShadow: '0 10px 20px rgba(41, 182, 246, 0.3)'
                },
                backgroundElement: (
                    <div style={{
                        position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px',
                        background: 'rgba(255, 235, 59, 0.6)',
                        borderRadius: '50%',
                        filter: 'blur(60px)',
                        animation: 'pulse-glow 5s infinite'
                    }} />
                )
            };

        case 'EID':
            return {
                title: isFa ? 'عید شما مبارک' : 'EID MUBARAK',
                subtitle: isFa ? 'بهترین‌ها را برای شما در این روز عزیز آرزومندیم.' : 'Wishing you a joyous celebration filled with blessings and delicious feasts.',
                badge: 'CELEBRATION',
                buttonText: 'VIEW SPECIALS',
                containerStyle: {
                    background: '#004d40' // Rich Teal Green
                },
                glassEffect: true,
                textStyle: { color: '#e0f2f1' },
                titleStyle: {
                    color: '#ffd700', // Gold
                    fontFamily: 'serif',
                    letterSpacing: '1px'
                },
                badgeStyle: {
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid #00695c',
                    color: '#80cbc4'
                },
                buttonStyle: {
                    background: 'linear-gradient(45deg, #ffd700, #ffecb3)',
                    color: '#004d40',
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
                },
                backgroundElement: (
                    <>
                        {/* Islamic Geometric Pattern Overlay (Simulated) */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: 'radial-gradient(#80cbc4 1px, transparent 1px)',
                            backgroundSize: '30px 30px',
                            opacity: 0.1
                        }} />
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            width: '80%', height: '80%',
                            border: '1px solid rgba(255,215,0,0.1)',
                            transform: 'translate(-50%, -50%) rotate(45deg)',
                        }} />
                        <div style={{
                            position: 'absolute', right: '5%', top: '10%', fontSize: '5rem', opacity: 0.1, color: '#ffd700'
                        }} >🌙</div>
                    </>
                )
            };

        default:
            return null;
    }
}
