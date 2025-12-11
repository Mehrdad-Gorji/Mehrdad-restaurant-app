import { prisma } from '@/lib/prisma';
import { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import CopyButton from './copy-button';

export default async function OffersPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const locale = lang as Locale;
    const dict = await getDictionary(locale);

    // Fetch active offers
    let offers: any[] = [];
    try {
        // @ts-ignore
        offers = await prisma.offer.findMany({
            where: {
                isActive: true,
                OR: [
                    { startDate: null },
                    { startDate: { lte: new Date() } }
                ],
                AND: [
                    { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
                ]
            },
            include: { translations: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error('Failed to fetch offers', e);
        offers = [];
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Gradient Orbs */}
            <div style={{
                position: 'fixed',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 107, 107, 0.08) 0%, transparent 70%)',
                top: '-200px',
                left: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
                bottom: '0',
                right: '-100px',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ padding: '4rem 1rem', position: 'relative', zIndex: 2 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 152, 0, 0.2))',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '50px',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '1rem',
                        color: '#FF6B6B'
                    }}>
                        🏷️ {locale === 'sv' ? 'Erbjudanden' : 'Offers'}
                    </span>
                    <h1 style={{
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #ff9800 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: '800',
                        letterSpacing: '-1px'
                    }}>
                        {locale === 'sv' ? 'Specialerbjudanden' : locale === 'de' ? 'Sonderangebote' : 'Special Offers'}
                    </h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)' }}>
                        {locale === 'sv'
                            ? 'Missa inte våra fantastiska erbjudanden och rabatter!'
                            : 'Don\'t miss our amazing deals and discounts!'}
                    </p>
                </div>

                {offers.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '24px'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🏷️</div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
                            {locale === 'sv' ? 'Inga erbjudanden just nu.' : 'No active offers at the moment.'}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '2rem'
                    }}>
                        {offers.map((offer: any) => {
                            const translation = offer.translations.find((t: any) => t.language === locale) || {};
                            const title = translation.title || offer.title;
                            const description = translation.description || offer.description;

                            return (
                                <div key={offer.id} className="product-card" style={{
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <div style={{ position: 'relative', height: '220px', background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)' }}>
                                        {offer.image ? (
                                            <img
                                                src={offer.image.startsWith('http') || offer.image.startsWith('/') ? offer.image : `/api/uploads/${offer.image}`}
                                                alt={title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '5rem',
                                                background: 'linear-gradient(135deg, rgba(255,107,107,0.2) 0%, rgba(255,152,0,0.2) 100%)'
                                            }}>
                                                🎁
                                            </div>
                                        )}
                                        {offer.discountCode && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 15,
                                                right: 15,
                                                background: 'linear-gradient(135deg, #FF6B6B 0%, #ff9800 100%)',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '50px',
                                                fontWeight: 'bold',
                                                color: '#fff',
                                                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                                                fontSize: '0.85rem'
                                            }}>
                                                {offer.discountCode}
                                            </div>
                                        )}
                                        {/* Overlay Gradient */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '50%',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                                        }} />
                                    </div>

                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h2 style={{
                                            fontSize: '1.5rem',
                                            marginBottom: '0.75rem',
                                            color: '#fff',
                                            fontWeight: '700'
                                        }}>{title}</h2>
                                        <p style={{
                                            color: 'rgba(255,255,255,0.5)',
                                            lineHeight: 1.6,
                                            flex: 1,
                                            fontSize: '0.95rem'
                                        }}>{description}</p>

                                        {(offer.startDate || offer.endDate) && (
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: 'rgba(255,255,255,0.4)',
                                                marginTop: '1rem',
                                                fontStyle: 'italic',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <span>📅</span>
                                                {offer.startDate && !offer.endDate && `${locale === 'sv' ? 'Gäller från' : 'Valid from'}: ${new Date(offer.startDate).toLocaleDateString()}`}
                                                {!offer.startDate && offer.endDate && `${locale === 'sv' ? 'Gäller till' : 'Valid until'}: ${new Date(offer.endDate).toLocaleDateString()}`}
                                                {offer.startDate && offer.endDate && `${new Date(offer.startDate).toLocaleDateString()} - ${new Date(offer.endDate).toLocaleDateString()}`}
                                            </div>
                                        )}

                                        {offer.discountCode && (
                                            <div style={{ marginTop: '1.5rem' }}>
                                                <CopyButton code={offer.discountCode} label={locale === 'sv' ? 'Kopiera kod' : 'Copy Code'} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
