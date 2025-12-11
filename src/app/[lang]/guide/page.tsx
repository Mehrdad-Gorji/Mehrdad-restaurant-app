'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Locale } from '@/i18n-config';

interface GuideStep {
    emoji: string;
    title: string;
    description: string;
    image?: string;
}

// Image paths matching the 5 steps
const STEP_IMAGES = [
    '/guide/menu.png',      // 1. Browse
    '/guide/menu.png',      // 2. Zone Check (using menu/map context or same)
    '/guide/customize.png', // 3. Customize
    '/guide/checkout.png',  // 4. Checkout
    '/guide/tracking.png'   // 5. Tracking
];

const CONTENT = {
    en: {
        title: "How to Order",
        subtitle: "Complete guide to accounts, delivery zones, and scheduling",
        btnMenu: "Start Ordering Now",
        steps: [
            {
                emoji: "👤",
                title: "1. Create an Account",
                description: "Important! You must register or log in to access exclusive discounts, use coupons, and earn loyalty rewards. Guest users cannot use promo codes."
            },
            {
                emoji: "📍",
                title: "2. Check Delivery Zone",
                description: "Enter your Zip Code to verify we deliver to you. Delivery fees are calculated based on your location/zone."
            },
            {
                emoji: "🍕",
                title: "3. Choose & Customize",
                description: "Browse the menu and customize your meal. Select sizes, add extras, or remove ingredients to your taste."
            },
            {
                emoji: "📅",
                title: "4. Schedule & Tip",
                description: "In checkout, you can order ASAP or 'Schedule for Later' to reserve a specific time. You can also add a tip for your driver directly."
            },
            {
                emoji: "🚀",
                title: "5. Track Order",
                description: "Once placed, watch your order status in real-time on the tracker page until it arrives at your door."
            }
        ]
    },
    sv: {
        title: "Hur man beställer",
        subtitle: "Komplett guide till konton, leveranszoner och schemaläggning",
        btnMenu: "Börja beställa nu",
        steps: [
            {
                emoji: "👤",
                title: "1. Skapa ett konto",
                description: "Viktigt! Du måste registrera dig eller logga in för att få tillgång till exklusiva rabatter, använda kuponger och samla lojalitetspoäng. Gäster kan inte använda kampanjkoder."
            },
            {
                emoji: "📍",
                title: "2. Kontrollera leveranszon",
                description: "Ange ditt postnummer för att bekräfta att vi levererar till dig. Leveransavgifter beräknas baserat på din plats/zon."
            },
            {
                emoji: "🍕",
                title: "3. Välj & Anpassa",
                description: "Bläddra i menyn och anpassa din måltid. Välj storlekar, lägg till extra tillbehör eller ta bort ingredienser efter smak."
            },
            {
                emoji: "📅",
                title: "4. Schemalägg & Dricks",
                description: "I kassan kan du beställa ASAP eller 'Schemalägg för senare' för att boka en specifik tid. Du kan också lägga till dricks till din förare direkt."
            },
            {
                emoji: "🚀",
                title: "5. Spåra beställning",
                description: "När beställningen är lagd, följ din orderstatus i realtid på spårningssidan tills den anländer till din dörr."
            }
        ]
    },
    de: {
        title: "Wie man bestellt",
        subtitle: "Vollständige Anleitung zu Konten, Lieferzonen und Planung",
        btnMenu: "Jetzt bestellen",
        steps: [
            {
                emoji: "👤",
                title: "1. Konto erstellen",
                description: "Wichtig! Sie müssen sich registrieren oder anmelden, um auf exklusive Rabatte zuzugreifen, Gutscheine zu nutzen und Treuepunkte zu sammeln."
            },
            {
                emoji: "📍",
                title: "2. Lieferzone prüfen",
                description: "Geben Sie Ihre Postleitzahl ein, um zu prüfen, ob wir zu Ihnen liefern. Liefergebühren werden basierend auf Ihrem Standort berechnet."
            },
            {
                emoji: "🍕",
                title: "3. Auswählen & Anpassen",
                description: "Durchsuchen Sie das Menü und passen Sie Ihre Mahlzeit an. Wählen Sie Größen, fügen Sie Extras hinzu oder entfernen Sie Zutaten."
            },
            {
                emoji: "📅",
                title: "4. Planen & Trinkgeld",
                description: "An der Kasse können Sie sofort bestellen oder 'Für später planen', um eine Zeit zu reservieren. Sie können auch Trinkgeld für den Fahrer hinzufügen."
            },
            {
                emoji: "🚀",
                title: "5. Bestellung verfolgen",
                description: "Beobachten Sie nach der Bestellung den Status in Echtzeit auf der Tracking-Seite, bis das Essen bei Ihnen ankommt."
            }
        ]
    },
    fa: {
        title: "راهنمای کامل سفارش",
        subtitle: "راهنمای حساب کاربری، مناطق ارسال و رزرو سفارش",
        btnMenu: "شروع سفارش",
        steps: [
            {
                emoji: "👤",
                title: "۱. ایجاد حساب کاربری",
                description: "مهم! برای دسترسی به تخفیف‌های ویژه، استفاده از کوپن‌ها و دریافت امتیاز وفاداری باید ثبت‌نام کنید یا وارد شوید. کاربران مهمان نمی‌توانند از کد تخفیف استفاده کنند."
            },
            {
                emoji: "📍",
                title: "۲. بررسی منطقه ارسال",
                description: "کد پستی خود را وارد کنید تا مطمئن شوید به منطقه شما ارسال داریم. هزینه ارسال بر اساس منطقه شما محاسبه می‌شود."
            },
            {
                emoji: "🍕",
                title: "۳. انتخاب و شخصی‌سازی",
                description: "منو را مرور کنید و غذای خود را شخصی‌سازی کنید. سایز را انتخاب کنید، مواد اضافه کنید یا موادی که دوست ندارید را حذف کنید."
            },
            {
                emoji: "📅",
                title: "۴. رزرو زمان و انعام",
                description: "در تسویه حساب، می‌توانید سفارش فوری دهید یا برای 'زمان مشخص' رزرو کنید. همچنین می‌توانید انعام راننده را همان‌جا اضافه کنید."
            },
            {
                emoji: "🚀",
                title: "۵. پیگیری سفارش",
                description: "پس از ثبت، وضعیت سفارش را به صورت زنده در صفحه پیگیری مشاهده کنید تا زمانی که غذا به درب منزل شما برسد."
            }
        ]
    }
};

export default function GuidePage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = use(params);
    const content = CONTENT[lang as keyof typeof CONTENT] || CONTENT.en;
    const isRtl = lang === 'fa';

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
            {/* Hero */}
            <section style={{
                padding: '8rem 2rem 4rem',
                background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                    }}>
                        {content.title}
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)' }}>
                        {content.subtitle}
                    </p>
                </div>
            </section>

            {/* Steps Timeline */}
            <section style={{ padding: '2rem 2rem 6rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gap: '4rem', position: 'relative' }}>

                    {/* Vertical Line */}
                    <div style={{
                        position: 'absolute',
                        left: isRtl ? 'auto' : '50%',
                        right: isRtl ? '50%' : 'auto',
                        top: '0',
                        bottom: '0',
                        width: '2px',
                        background: 'linear-gradient(to bottom, #6366f1, transparent)',
                        transform: 'translateX(-50%)',
                        display: 'none', // Hidden on mobile, shown in media query
                    }} className="desktop-line" />

                    <style jsx>{`
                        @media (min-width: 768px) {
                            .desktop-line { display: block !important; }
                            .step-card:nth-child(even) { margin-left: auto; }
                            .step-card:nth-child(odd) { margin-right: auto; }
                        }
                    `}</style>

                    {content.steps.map((step, idx) => (
                        <div key={idx} className="step-card" style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px',
                            padding: '2rem',
                            maxWidth: '450px',
                            position: 'relative',
                            zIndex: 1,
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            direction: isRtl ? 'rtl' : 'ltr'
                        }}>
                            {/* Number Badge */}
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                marginBottom: '0.5rem'
                            }}>
                                {step.emoji}
                            </div>

                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                                {step.title}
                            </h3>
                            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', margin: 0 }}>
                                {step.description}
                            </p>

                            {/* Step Image */}
                            <div style={{
                                width: '100%',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                marginTop: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                aspectRatio: '16/9',
                                position: 'relative'
                            }}>
                                <img
                                    src={STEP_IMAGES[idx] || STEP_IMAGES[0]}
                                    alt={`Step ${idx + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ textAlign: 'center', paddingBottom: '6rem' }}>
                <Link href={`/${lang}/menu`} style={{
                    display: 'inline-block',
                    padding: '1rem 3rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    borderRadius: '50px',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                    transition: 'transform 0.2s',
                }}>
                    {content.btnMenu}
                </Link>
            </section>
        </div>
    );
}
