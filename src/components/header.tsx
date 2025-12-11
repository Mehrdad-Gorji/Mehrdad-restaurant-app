import Link from 'next/link';
import LanguageSwitcher from './language-switcher';
import CartButton from './cart-button';
import UserMenu from './user-menu';
import MobileMenu from './mobile-menu';
import { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { prisma } from '@/lib/prisma';
import './header.css';

export default async function Header({ lang }: { lang: Locale }) {
    const dict = await getDictionary(lang);

    let settings = null;
    try {
        // @ts-ignore
        settings = await prisma.siteSettings.findFirst();
    } catch (e) {
        // ignore
    }

    let navLinks = [
        { label: 'Home', labelSv: 'Hem', labelDe: 'Startseite', labelFa: 'خانه', url: '/' },
        { label: 'Menu', labelSv: 'Meny', labelDe: 'Menü', labelFa: 'منو', url: '/menu' },
        { label: 'Offers', labelSv: 'Erbjudanden', labelDe: 'Angebote', labelFa: 'پیشنهادها', url: '/offers' },
        { label: 'My Orders', labelSv: 'Mina Beställningar', labelDe: 'Meine Bestellungen', labelFa: 'سفارشات من', url: '/my-orders' }
    ];
    try {
        if (settings?.headerNavLinks) {
            navLinks = JSON.parse(settings.headerNavLinks);
        }
    } catch { }

    return (
        <header className="site-header">
            <div className="container header-container">
                {/* Logo */}
                <div className="logo">
                    <Link href={`/${lang}`} className="logo-link">
                        {settings?.logo ? (
                            <img
                                src={settings.logo.startsWith('/') ? settings.logo : `/api/uploads/${settings.logo}`}
                                alt={settings.brandName || "Logo"}
                                className="logo-icon"
                            />
                        ) : (
                            <>
                                <span className="logo-icon-emoji">🍕</span>
                                <span className="logo-text">
                                    {settings?.brandName || 'PizzaShop'}
                                </span>
                            </>
                        )}
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    <ul className="nav-list">
                        {navLinks.map((link: any, index: number) => (
                            <li key={index}>
                                <Link href={`/${lang}${link.url === '/' ? '' : link.url}`} className="nav-link">
                                    {lang === 'sv' ? link.labelSv : lang === 'de' ? link.labelDe : lang === 'fa' ? link.labelFa : link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Desktop Right Side Actions */}
                <div className="desktop-actions">
                    <CartButton lang={lang} label={dict.header.cart} />
                    <UserMenu lang={lang} />
                    <div className="lang-switcher-wrapper">
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Mobile Right Side - Cart + Hamburger */}
                <div className="mobile-actions">
                    <CartButton lang={lang} label={dict.header.cart} />
                    <MobileMenu lang={lang} navLinks={navLinks} dict={dict} />
                </div>
            </div>
        </header>
    );
}
