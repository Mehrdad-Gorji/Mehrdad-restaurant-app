
import Link from 'next/link';
import { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { prisma } from '@/lib/prisma';

export default async function Footer({ lang }: { lang: Locale }) {
    const dict = await getDictionary(lang);

    let settings = null;
    try {
        // @ts-ignore
        settings = await prisma.siteSettings.findFirst();
    } catch (e) {
        // ignore
    }

    const brandDesc = settings?.footerBrandDesc || dict.footer?.brandDescription;
    const address = settings?.footerAddress || 'Storgatan 1, 123 45 Stockholm, Sweden';
    const phone = settings?.footerPhone || '+46 123 456 789';
    const email = settings?.footerEmail || 'info@pizzashop.com';
    const facebook = settings?.socialFacebook || '#';
    const instagram = settings?.socialInstagram || '#';

    return (
        <footer style={{
            backgroundColor: 'var(--text-main)', // Dark Charcoal
            color: 'white',
            padding: '4rem 0 2rem',
            marginTop: 'auto'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem'
                }}>
                    {/* Brand Column */}
                    <div>
                        <Link href={`/${lang}`} style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            marginBottom: '1rem',
                            display: 'block',
                            width: 'fit-content'
                        }}>
                            {settings?.logo ? (
                                <img src={settings.logo.startsWith('/') ? settings.logo : `/api/uploads/${settings.logo}`} alt={settings.brandName || "Logo"} style={{ height: '50px', objectFit: 'contain' }} />
                            ) : (
                                <span style={{
                                    background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    🍕 {settings?.brandName || 'PizzaShop'}
                                </span>
                            )}
                        </Link>
                        <p style={{ color: '#9CA3AF', lineHeight: '1.6' }}>
                            {brandDesc}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            {/* Social Icons */}
                            {facebook && (
                                <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.5rem', textDecoration: 'none', opacity: 0.9 }}>
                                    📘
                                </a>
                            )}
                            {instagram && (
                                <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.5rem', textDecoration: 'none', opacity: 0.9 }}>
                                    📷
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{dict.footer?.quickLinks}</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['menu', 'about', 'contact', 'guide', 'login'].map((link) => (
                                <li key={link} style={{ marginBottom: '0.8rem' }}>
                                    <Link href={`/${lang}/${link}`} style={{
                                        color: '#D1D5DB',
                                        transition: 'color 0.2s'
                                    }} className="hover:text-primary">
                                        {dict.header?.[link as keyof typeof dict.header] || link.charAt(0).toUpperCase() + link.slice(1)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{dict.footer?.contact}</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <span>📍</span>
                                <div>{address}</div>
                            </li>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <span>📞</span>
                                <div>{phone}</div>
                            </li>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <span>✉️</span>
                                <div>{email}</div>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{dict.footer?.newsletter}</h3>
                        <p style={{ color: '#9CA3AF', marginBottom: '1rem' }}>{dict.footer?.newsletterDesc}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                                type="email"
                                placeholder="Email address"
                                style={{
                                    padding: '0.8rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #4B5563',
                                    backgroundColor: '#374151',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <button style={{
                                padding: '0.8rem',
                                borderRadius: '8px',
                                background: 'var(--primary)',
                                color: 'white',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer'
                            }}>
                                {dict.footer?.subscribe}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid #374151',
                    paddingTop: '2rem',
                    textAlign: 'center',
                    color: '#6B7280',
                    fontSize: '0.9rem'
                }}>
                    &copy; {new Date().getFullYear()} {settings?.brandName || 'PizzaShop'}. {dict.footer?.rights}
                </div>
            </div>
        </footer>
    );
}
