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
    customImage?: string;
    customColor?: string;
    customOpacity?: number;
    customIcon?: string;
}

// Theme configurations with modern design
const themeConfigs: Record<string, {
    icon: string;
    gradient: string;
    backgroundImage?: string;
    accentColor: string;
    textColor: string;
    buttonGradient: string;
    defaultTitle: { en: string; fa: string };
    defaultSubtitle: { en: string; fa: string };
    defaultBadge: { en: string; fa: string };
    defaultButton: { en: string; fa: string };
    decorativeElements: React.ReactNode;
}> = {
    'BLACK_FRIDAY': {
        icon: '🏷️',
        gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        backgroundImage: '/images/themes/black-friday.png',
        accentColor: '#ff0000',
        textColor: '#ffffff',
        buttonGradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
        defaultTitle: { en: 'BLACK FRIDAY', fa: 'جمعه سیاه' },
        defaultSubtitle: { en: 'Up to 70% OFF on selected items. Limited time only!', fa: 'تا ۷۰٪ تخفیف روی محصولات منتخب!' },
        defaultBadge: { en: 'MEGA SALE', fa: 'حراج بزرگ' },
        defaultButton: { en: 'SHOP NOW', fa: 'خرید کنید' },
        decorativeElements: (
            <>
                <div style={{ position: 'absolute', top: '10%', right: '5%', fontSize: '80px', opacity: 0.1 }}>🛍️</div>
                <div style={{ position: 'absolute', bottom: '10%', left: '5%', fontSize: '60px', opacity: 0.1 }}>💰</div>
            </>
        )
    },
    'CHRISTMAS': {
        icon: '🎄',
        gradient: 'linear-gradient(135deg, #165B33 0%, #0D3B22 50%, #165B33 100%)',
        backgroundImage: '/images/themes/christmas.png',
        accentColor: '#D4AF37',
        textColor: '#ffffff',
        buttonGradient: 'linear-gradient(135deg, #C62828, #8B0000)',
        defaultTitle: { en: 'MERRY CHRISTMAS', fa: 'کریسمس مبارک' },
        defaultSubtitle: { en: 'Celebrate the magic of the season with our festive holiday menu.', fa: 'جادوی زمستان را با خوراکی‌های گرم جشن بگیرید.' },
        defaultBadge: { en: 'HOLIDAY SPECIAL', fa: 'ویژه تعطیلات' },
        defaultButton: { en: 'SEE MENU', fa: 'مشاهده منو' },
        decorativeElements: (
            <>
                <div style={{ position: 'absolute', top: '5%', right: '10%', fontSize: '50px', opacity: 0.2 }}>🎄</div>
                <div style={{ position: 'absolute', bottom: '5%', left: '10%', fontSize: '40px', opacity: 0.15 }}>🎅</div>
                <div style={{ position: 'absolute', top: '20%', left: '5%', fontSize: '30px', opacity: 0.2 }}>⭐</div>
            </>
        )
    },
    'NEW_YEAR': {
        icon: '🎆',
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        backgroundImage: '/images/themes/new-year.png',
        accentColor: '#FFD700',
        textColor: '#ffffff',
        buttonGradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
        defaultTitle: { en: 'HAPPY NEW YEAR', fa: 'سال نو مبارک' },
        defaultSubtitle: { en: 'A fresh start deserves fresh flavors. Celebrate with us!', fa: 'آغاز سالی نو با طعم‌های بی‌نظیر!' },
        defaultBadge: { en: 'NEW YEAR EVE', fa: 'شب سال نو' },
        defaultButton: { en: 'CELEBRATE', fa: 'جشن بگیرید' },
        decorativeElements: (
            <>
                <div style={{ position: 'absolute', top: '10%', right: '15%', fontSize: '60px', opacity: 0.15 }}>🎆</div>
                <div style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: '50px', opacity: 0.1 }}>🥂</div>
            </>
        )
    },
    'VALENTINE': {
        icon: '💕',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 50%, #c94c4c 100%)',
        backgroundImage: '/images/themes/valentine.png',
        accentColor: '#ffffff',
        textColor: '#ffffff',
        buttonGradient: 'linear-gradient(135deg, #ffffff, #f8f8f8)',
        defaultTitle: { en: 'LOVE IS IN THE AIR', fa: 'عشق در هوا' },
        defaultSubtitle: { en: 'A romantic dinner for two. Create memories together.', fa: 'یک شام رمانتیک برای دو نفر.' },
        defaultBadge: { en: 'VALENTINE SPECIAL', fa: 'ویژه ولنتاین' },
        defaultButton: { en: 'ORDER FOR TWO', fa: 'سفارش دو نفره' },
        decorativeElements: (
            <>
                <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '50px', opacity: 0.2 }}>💕</div>
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', fontSize: '40px', opacity: 0.15 }}>💝</div>
            </>
        )
    },
    'EASTER': {
        icon: '🐰',
        gradient: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3b6 100%)',
        backgroundImage: '/images/themes/easter.png',
        accentColor: '#7c4dff',
        textColor: '#1a1a1a',
        buttonGradient: 'linear-gradient(135deg, #7c4dff, #651fff)',
        defaultTitle: { en: 'SPRING DELIGHTS', fa: 'خوشی‌های بهاری' },
        defaultSubtitle: { en: 'Fresh flavors and colorful dishes for the season!', fa: 'طعم‌های تازه و رنگارنگ بهاری!' },
        defaultBadge: { en: 'EASTER SPECIAL', fa: 'ویژه عید' },
        defaultButton: { en: 'EXPLORE', fa: 'کاوش کنید' },
        decorativeElements: (
            <>
                <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '50px', opacity: 0.3 }}>🐰</div>
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', fontSize: '40px', opacity: 0.25 }}>🥚</div>
            </>
        )
    },
    'HALLOWEEN': {
        icon: '🎃',
        gradient: 'linear-gradient(135deg, #1a0a24 0%, #2d0c3d 50%, #1a0a24 100%)',
        backgroundImage: '/images/themes/halloween.png',
        accentColor: '#ff6d00',
        textColor: '#ffffff',
        buttonGradient: 'linear-gradient(135deg, #ff6d00, #ff8f00)',
        defaultTitle: { en: 'TRICK OR TREAT', fa: 'شیرینی یا شوخی' },
        defaultSubtitle: { en: 'Spooktacular savings on hauntingly delicious items!', fa: 'تخفیف‌های ترسناک برای شب‌های تاریک!' },
        defaultBadge: { en: 'HALLOWEEN', fa: 'هالووین' },
        defaultButton: { en: 'GET DEALS', fa: 'دریافت تخفیف' },
        decorativeElements: (
            <>
                <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '60px', opacity: 0.2 }}>🎃</div>
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', fontSize: '50px', opacity: 0.15 }}>👻</div>
                <div style={{ position: 'absolute', top: '20%', left: '5%', fontSize: '30px', opacity: 0.1 }}>🦇</div>
            </>
        )
    },
    'SUMMER': {
        icon: '☀️',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ff9a9e 100%)',
        backgroundImage: '/images/themes/summer.png',
        accentColor: '#ffffff',
        textColor: '#ffffff',
        buttonGradient: 'linear-gradient(135deg, #ffffff, #f8f8f8)',
        defaultTitle: { en: 'SUMMER VIBES', fa: 'موج‌های تابستانی' },
        defaultSubtitle: { en: 'Beat the heat with refreshing drinks and light meals!', fa: 'با نوشیدنی‌های خنک تابستان را خوش بگذرانید!' },
        defaultBadge: { en: 'HOT DEALS', fa: 'پیشنهاد ویژه' },
        defaultButton: { en: 'COOL DOWN', fa: 'خنک شوید' },
        decorativeElements: (
            <>
                <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '60px', opacity: 0.2 }}>☀️</div>
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', fontSize: '50px', opacity: 0.15 }}>🏖️</div>
            </>
        )
    },
    'EID': {
        icon: '🌙',
        gradient: 'linear-gradient(135deg, #1d4e5f 0%, #2d6a4f 50%, #40916c 100%)',
        backgroundImage: '/images/themes/eid.png',
        accentColor: '#FFD700',
        textColor: '#ffffff',
        buttonGradient: 'linear-gradient(135deg, #FFD700, #FFC107)',
        defaultTitle: { en: 'EID MUBARAK', fa: 'عید شما مبارک' },
        defaultSubtitle: { en: 'Wishing you a joyous celebration filled with blessings.', fa: 'بهترین‌ها را برای شما آرزومندیم.' },
        defaultBadge: { en: 'BLESSED EID', fa: 'عید مبارک' },
        defaultButton: { en: 'SPECIALS', fa: 'پیشنهادات ویژه' },
        decorativeElements: (
            <>
                <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '60px', opacity: 0.2 }}>🌙</div>
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', fontSize: '50px', opacity: 0.15 }}>✨</div>
            </>
        )
    }
};

export default function SpecialOccasionWidget({
    theme,
    lang,
    mode = 'card',
    customTitle,
    customSubtitle,
    customButtonText,
    customBadge,
    customImage,
    customColor,
    customOpacity = 100,
    customIcon
}: SpecialOccasionWidgetProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (theme && theme !== 'NONE') {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [theme]);

    if (!isVisible || !theme || theme === 'NONE') return null;

    let config = themeConfigs[theme];

    // Handle CUSTOM theme
    if (theme === 'CUSTOM') {
        const baseColor = customColor || '#3b82f6';
        const opacityValue = (customOpacity ?? 100) / 100;

        const hexToRgba = (hex: string, alpha: number) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : hex;
        };

        const accentColorWithOpacity = hexToRgba(baseColor, opacityValue);
        const endColorWithOpacity = hexToRgba('#1f2937', opacityValue);

        config = {
            icon: customIcon || '🎨',
            gradient: `linear-gradient(135deg, ${accentColorWithOpacity} 0%, ${endColorWithOpacity} 100%)`,
            backgroundImage: customImage,
            accentColor: baseColor,
            textColor: '#ffffff',
            buttonGradient: `linear-gradient(135deg, ${baseColor}, ${baseColor}dd)`,
            defaultTitle: { en: 'SPECIAL OFFER', fa: 'پیشنهاد ویژه' },
            defaultSubtitle: { en: 'Check out our latest custom deals!', fa: 'از پیشنهادهای ویژه ما دیدن کنید!' },
            defaultBadge: { en: 'CUSTOM', fa: 'سفارشی' },
            defaultButton: { en: 'CHECK IT OUT', fa: 'بررسی کنید' },
            decorativeElements: (
                <>
                    <div style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '60px', opacity: 0.1 }}>{customIcon || '✨'}</div>
                    <div style={{ position: 'absolute', bottom: '10%', left: '10%', fontSize: '50px', opacity: 0.1 }}>{customIcon || '🌟'}</div>
                </>
            )
        };
    }

    if (!config) return null;

    const isFa = lang === 'fa';
    const isBanner = mode === 'banner';

    const displayTitle = customTitle || (isFa ? config.defaultTitle.fa : config.defaultTitle.en);
    const displaySubtitle = customSubtitle || (isFa ? config.defaultSubtitle.fa : config.defaultSubtitle.en);
    const displayBadge = customBadge || (isFa ? config.defaultBadge.fa : config.defaultBadge.en);
    const displayButton = customButtonText || (isFa ? config.defaultButton.fa : config.defaultButton.en);
    const isEaster = theme === 'EASTER';

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'relative',
                width: '100%',
                minHeight: isBanner ? '400px' : '300px',
                borderRadius: isBanner ? '0' : '24px',
                overflow: 'hidden',
                background: isBanner ? 'transparent' : '#1a1a1a', // Fallback background
                boxShadow: isBanner ? 'none' : '0 25px 50px -12px rgba(0,0,0,0.5)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered && !isBanner ? 'scale(1.02)' : 'scale(1)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            {/* Background Image Layer */}
            {config.backgroundImage && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${config.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: theme === 'CUSTOM' ? 1 : 0.4
                }} />
            )}

            {/* Gradient Overlay (Moved here to be ON TOP of image) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: config.gradient,
                opacity: 1
            }} />

            {/* Dark Overlay for better text readability */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)'
            }} />

            {/* Decorative Background Elements */}
            {config.decorativeElements}

            {/* Glassmorphism Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(2px)'
            }} />

            {/* Animated Border Glow */}
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: isBanner ? '0' : '24px',
                border: `2px solid ${config.accentColor}`,
                opacity: isHovered ? 0.6 : 0.2,
                transition: 'opacity 0.3s',
                pointerEvents: 'none'
            }} />

            {/* Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                height: '100%',
                minHeight: isBanner ? '400px' : '300px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                direction: isFa ? 'rtl' : 'ltr'
            }}>

                {/* Badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '50px',
                    background: isEaster ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isEaster ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}`,
                    marginBottom: '1.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: isEaster ? config.textColor : 'white'
                }}>
                    <span style={{ fontSize: '1rem' }}>{config.icon}</span>
                    {displayBadge}
                </div>

                {/* Main Title */}
                <h2 style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: '900',
                    lineHeight: 1.1,
                    margin: '0 0 1rem 0',
                    color: theme === 'CHRISTMAS' ? config.accentColor : config.textColor,
                    textShadow: isEaster ? 'none' : '0 4px 20px rgba(0,0,0,0.3)',
                    letterSpacing: theme === 'NEW_YEAR' ? '8px' : '2px',
                    textTransform: 'uppercase'
                }}>
                    {displayTitle}
                </h2>

                {/* Subtitle */}
                <p style={{
                    fontSize: '1.1rem',
                    maxWidth: '500px',
                    margin: '0 auto 2rem auto',
                    lineHeight: 1.6,
                    color: isEaster ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
                    fontWeight: '400'
                }}>
                    {displaySubtitle}
                </p>

                {/* CTA Button */}
                <Link
                    href={`/${lang}/offers`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '14px 36px',
                        borderRadius: '50px',
                        background: config.buttonGradient,
                        color: theme === 'VALENTINE' ? '#c94c4c' :
                            theme === 'SUMMER' ? '#f5576c' :
                                theme === 'EASTER' ? '#ffffff' :
                                    theme === 'NEW_YEAR' ? '#1a1a2e' : '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        boxShadow: `0 10px 30px ${config.accentColor}40`,
                        transition: 'all 0.3s ease',
                        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                >
                    {displayButton}
                    <span style={{ fontSize: '1.1rem' }}>→</span>
                </Link>

                {/* Decorative Line */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '3px',
                    background: config.accentColor,
                    borderRadius: '3px',
                    opacity: 0.4
                }} />
            </div>
        </div>
    );
}
