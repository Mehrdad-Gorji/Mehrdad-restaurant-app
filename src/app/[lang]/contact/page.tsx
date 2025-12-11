import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Locale } from '@/i18n-config';
import ContactForm from '@/components/contact-form';

async function getSettings() {
    try {
        // @ts-ignore
        const settings = await prisma.siteSettings.findFirst();
        return settings;
    } catch {
        return null;
    }
}

const translations = {
    en: {
        title: 'Contact Us',
        subtitle: 'Get in Touch',
        description: 'Have a question, feedback, or want to make a reservation? We\'d love to hear from you!',
        form: {
            name: 'Your Name',
            email: 'Email Address',
            phone: 'Phone Number',
            subject: 'Subject',
            message: 'Your Message',
            send: 'Send Message',
            sending: 'Sending...',
            success: 'Message sent successfully! We\'ll get back to you soon.',
            error: 'Failed to send message. Please try again.',
            subjects: {
                general: 'General Inquiry',
                order: 'Order Related',
                feedback: 'Feedback',
                partnership: 'Business Partnership',
                other: 'Other'
            }
        },
        info: {
            address: 'Address',
            phone: 'Phone',
            email: 'Email',
            hours: 'Opening Hours'
        },
        followUs: 'Follow Us',
        findUs: 'Find Us'
    },
    sv: {
        title: 'Kontakta Oss',
        subtitle: 'Hör av dig',
        description: 'Har du en fråga, feedback eller vill göra en bokning? Vi vill gärna höra från dig!',
        form: {
            name: 'Ditt Namn',
            email: 'E-postadress',
            phone: 'Telefonnummer',
            subject: 'Ämne',
            message: 'Ditt Meddelande',
            send: 'Skicka Meddelande',
            sending: 'Skickar...',
            success: 'Meddelandet skickat! Vi återkommer snart.',
            error: 'Kunde inte skicka meddelandet. Försök igen.',
            subjects: {
                general: 'Allmän Förfrågan',
                order: 'Orderrelaterat',
                feedback: 'Feedback',
                partnership: 'Affärssamarbete',
                other: 'Övrigt'
            }
        },
        info: {
            address: 'Adress',
            phone: 'Telefon',
            email: 'E-post',
            hours: 'Öppettider'
        },
        followUs: 'Följ Oss',
        findUs: 'Hitta Oss'
    },
    de: {
        title: 'Kontakt',
        subtitle: 'Kontaktieren Sie Uns',
        description: 'Haben Sie eine Frage, Feedback oder möchten Sie reservieren? Wir freuen uns von Ihnen zu hören!',
        form: {
            name: 'Ihr Name',
            email: 'E-Mail-Adresse',
            phone: 'Telefonnummer',
            subject: 'Betreff',
            message: 'Ihre Nachricht',
            send: 'Nachricht Senden',
            sending: 'Senden...',
            success: 'Nachricht erfolgreich gesendet! Wir melden uns bald.',
            error: 'Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
            subjects: {
                general: 'Allgemeine Anfrage',
                order: 'Bestellbezogen',
                feedback: 'Feedback',
                partnership: 'Geschäftspartnerschaft',
                other: 'Sonstiges'
            }
        },
        info: {
            address: 'Adresse',
            phone: 'Telefon',
            email: 'E-Mail',
            hours: 'Öffnungszeiten'
        },
        followUs: 'Folgen Sie Uns',
        findUs: 'Finden Sie Uns'
    },
    fa: {
        title: 'تماس با ما',
        subtitle: 'ارتباط با ما',
        description: 'سوال، پیشنهاد یا رزرو دارید؟ خوشحال می‌شویم از شما بشنویم!',
        form: {
            name: 'نام شما',
            email: 'آدرس ایمیل',
            phone: 'شماره تلفن',
            subject: 'موضوع',
            message: 'پیام شما',
            send: 'ارسال پیام',
            sending: 'در حال ارسال...',
            success: 'پیام با موفقیت ارسال شد! به زودی پاسخ می‌دهیم.',
            error: 'ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.',
            subjects: {
                general: 'سوال عمومی',
                order: 'مربوط به سفارش',
                feedback: 'بازخورد',
                partnership: 'همکاری تجاری',
                other: 'سایر'
            }
        },
        info: {
            address: 'آدرس',
            phone: 'تلفن',
            email: 'ایمیل',
            hours: 'ساعات کاری'
        },
        followUs: 'ما را دنبال کنید',
        findUs: 'ما را پیدا کنید'
    }
};

export default async function ContactPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const settings = await getSettings();
    const t = translations[lang] || translations.en;

    const infoCards = [
        {
            icon: '📍',
            title: t.info.address,
            content: settings?.footerAddress || 'Gran Via de les Corts Catalanes, Barcelona',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            icon: '📞',
            title: t.info.phone,
            content: settings?.footerPhone || '+34 123 456 789',
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
        },
        {
            icon: '✉️',
            title: t.info.email,
            content: settings?.footerEmail || 'info@restaurant.com',
            gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
        },
        {
            icon: '🕐',
            title: t.info.hours,
            content: settings?.openingHours || 'Mon-Sun: 11:00 - 23:00',
            gradient: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'
        }
    ];

    const socialLinks = [
        { icon: '📘', name: 'Facebook', url: settings?.socialFacebook || '' },
        { icon: '📸', name: 'Instagram', url: settings?.socialInstagram || '' },
        { icon: '🐦', name: 'Twitter', url: settings?.socialTwitter || '' }
    ];

    let mapUrl = settings?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2036.790076211419!2d15.216666!3d59.271666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465c14d4a367527f%3A0x2a3e3c638e1467!2sStortorget%2C%20702%2011%20%C3%96rebro%2C%20Sweden!5e0!3m2!1sen!2sus!4v1652882000000!5m2!1sen!2sus";

    // Safety check: if user pasted the full iframe code, extract the src
    if (mapUrl.includes('<iframe')) {
        const match = mapUrl.match(/src="([^"]+)"/);
        if (match && match[1]) {
            mapUrl = match[1];
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                minHeight: '50vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '6rem 2rem 4rem'
            }}>
                {/* Background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                }} />

                {/* Gradient orbs */}
                <div style={{
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(255, 152, 0, 0.15) 0%, transparent 70%)',
                    top: '-20%',
                    right: '-10%',
                    filter: 'blur(80px)'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)',
                    bottom: '0',
                    left: '-5%',
                    filter: 'blur(60px)'
                }} />

                {/* Content */}
                <div style={{ position: 'relative', textAlign: 'center', maxWidth: '800px' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 87, 34, 0.2))',
                        borderRadius: '50px',
                        border: '1px solid rgba(255, 152, 0, 0.4)',
                        color: '#ff9800',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem'
                    }}>
                        ✉️ {t.subtitle}
                    </span>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: '800',
                        color: '#fff',
                        lineHeight: '1.1',
                        marginBottom: '1.5rem',
                        textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        {t.title}
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'rgba(255,255,255,0.7)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {t.description}
                    </p>
                </div>
            </section>

            {/* Info Cards */}
            <section style={{ padding: '0 2rem', marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {infoCards.map((card, index) => (
                        <div key={index} style={{
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '1.5rem',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '16px',
                                background: card.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                marginBottom: '1rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: 'rgba(255,255,255,0.5)',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {card.title}
                            </h3>
                            <p style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#fff',
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {card.content}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Form & Map Section */}
            <section style={{ padding: '5rem 2rem' }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '3rem'
                }}>
                    {/* Form */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '2.5rem'
                    }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: '#fff',
                            marginBottom: '1.5rem'
                        }}>
                            📝 {lang === 'sv' ? 'Skicka ett meddelande' : lang === 'de' ? 'Nachricht senden' : lang === 'fa' ? 'ارسال پیام' : 'Send a Message'}
                        </h2>
                        <ContactForm lang={lang} translations={t.form} />
                    </div>

                    {/* Map & Social */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Map */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '1.5rem',
                            flex: 1
                        }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: '1rem'
                            }}>
                                📍 {t.findUs}
                            </h3>
                            <div style={{
                                width: '100%',
                                height: '300px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.05)'
                            }}>
                                <iframe
                                    src={mapUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '1.5rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: '1rem'
                            }}>
                                🌐 {t.followUs}
                            </h3>
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                flexWrap: 'wrap'
                            }}>
                                {socialLinks.filter(s => s.url && s.url !== '#').map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1.25rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            textDecoration: 'none',
                                            fontSize: '1rem',
                                            fontWeight: '500',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.25rem' }}>{social.icon}</span>
                                        {social.name}
                                    </a>
                                ))}
                                {socialLinks.every(s => !s.url || s.url === '#') && (
                                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {lang === 'sv' ? 'Snart tillgänglig' : 'Coming soon'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '4rem 2rem',
                background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    color: '#fff',
                    marginBottom: '1.5rem'
                }}>
                    {lang === 'sv' ? 'Hungrig? Beställ nu!' : lang === 'de' ? 'Hungrig? Jetzt bestellen!' : lang === 'fa' ? 'گرسنه‌اید؟ همین الان سفارش دهید!' : 'Hungry? Order Now!'}
                </h2>
                <Link href={`/${lang}/menu`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 2.5rem',
                    background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    boxShadow: '0 10px 30px rgba(255, 152, 0, 0.3)',
                    transition: 'all 0.3s ease'
                }}>
                    {lang === 'sv' ? 'Se Menyn' : lang === 'de' ? 'Menü Ansehen' : lang === 'fa' ? 'مشاهده منو' : 'View Menu'} 🍕
                </Link>
            </section>
        </div>
    );
}
