import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Locale } from '@/i18n-config';

async function getAboutContent() {
    try {
        // @ts-ignore
        const about = await prisma.aboutPage.findFirst();
        return about;
    } catch {
        return null;
    }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const about = await getAboutContent();

    const title = lang === 'sv' ? about?.titleSv : lang === 'de' ? about?.titleDe : lang === 'fa' ? about?.titleFa : about?.title || 'About Us';
    const content = lang === 'sv' ? about?.contentSv : lang === 'de' ? about?.contentDe : lang === 'fa' ? about?.contentFa : about?.content || '';
    const mission = lang === 'sv' ? about?.missionSv : lang === 'de' ? about?.missionDe : lang === 'fa' ? about?.missionFa : about?.mission || '';

    const isRTL = lang === 'fa';

    let teamMembers: { name: string; role: string; image: string }[] = [];
    try {
        teamMembers = JSON.parse(about?.teamMembers || '[]');
    } catch {
        teamMembers = [];
    }

    const heroImage = about?.heroImage
        ? (about.heroImage.startsWith('/') || about.heroImage.startsWith('http') ? about.heroImage : `/api/uploads/${about.heroImage}`)
        : null;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', direction: isRTL ? 'rtl' : 'ltr' }}>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {/* Background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: heroImage
                        ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url('${heroImage}')`
                        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }} />

                {/* Gradient orbs */}
                <div style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
                    top: '-10%',
                    right: '10%',
                    filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(255, 107, 107, 0.25) 0%, transparent 70%)',
                    bottom: '10%',
                    left: '5%',
                    filter: 'blur(50px)'
                }} />

                {/* Content */}
                <div style={{ position: 'relative', textAlign: 'center', padding: '2rem', maxWidth: '800px' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(168, 85, 247, 0.2))',
                        borderRadius: '50px',
                        border: '1px solid rgba(147, 51, 234, 0.4)',
                        color: '#a855f7',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem'
                    }}>
                        {lang === 'sv' ? 'Vår Historia' : lang === 'de' ? 'Unsere Geschichte' : lang === 'fa' ? 'داستان ما' : 'Our Story'}
                    </span>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: '800',
                        color: '#fff',
                        lineHeight: '1.1',
                        marginBottom: '1.5rem',
                        textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        {title}
                    </h1>
                </div>
            </section>

            {/* Mission Section */}
            {mission && (
                <section style={{
                    padding: '5rem 2rem',
                    background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)'
                }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{
                            padding: '3rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>🎯</span>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#a855f7',
                                marginBottom: '1rem'
                            }}>
                                {lang === 'sv' ? 'Vårt Uppdrag' : lang === 'de' ? 'Unsere Mission' : lang === 'fa' ? 'ماموریت ما' : 'Our Mission'}
                            </h2>
                            <p style={{
                                fontSize: '1.25rem',
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: '1.8',
                                fontStyle: 'italic'
                            }}>
                                "{mission}"
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Content Section */}
            <section style={{
                padding: '5rem 2rem',
                background: '#0a0a0a'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{
                        fontSize: '1.125rem',
                        color: 'rgba(255,255,255,0.75)',
                        lineHeight: '1.9',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {content}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            {teamMembers.length > 0 && (
                <section style={{
                    padding: '5rem 2rem',
                    background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)'
                }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: '#fff',
                            textAlign: 'center',
                            marginBottom: '3rem'
                        }}>
                            {lang === 'sv' ? 'Vårt Team' : lang === 'de' ? 'Unser Team' : lang === 'fa' ? 'تیم ما' : 'Our Team'}
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem'
                        }}>
                            {teamMembers.map((member, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {member.image && (
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            margin: '0 auto 1.5rem',
                                            border: '3px solid rgba(168, 85, 247, 0.5)'
                                        }}>
                                            <img
                                                src={member.image.startsWith('/') ? member.image : `/api/uploads/${member.image}`}
                                                alt={member.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: '#fff',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {member.name}
                                    </h3>
                                    <p style={{
                                        color: '#a855f7',
                                        fontWeight: '500'
                                    }}>
                                        {member.role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section style={{
                padding: '5rem 2rem',
                background: '#0a0a0a',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    color: '#fff',
                    marginBottom: '1.5rem'
                }}>
                    {lang === 'sv' ? 'Redo att beställa?' : lang === 'de' ? 'Bereit zu bestellen?' : lang === 'fa' ? 'آماده سفارش هستید؟' : 'Ready to Order?'}
                </h2>
                <Link href={`/${lang}/menu`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 2.5rem',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)',
                    transition: 'all 0.3s ease'
                }}>
                    {lang === 'sv' ? 'Se Menyn' : lang === 'de' ? 'Menü Ansehen' : lang === 'fa' ? 'مشاهده منو' : 'View Menu'} →
                </Link>
            </section>
        </div>
    );
}
