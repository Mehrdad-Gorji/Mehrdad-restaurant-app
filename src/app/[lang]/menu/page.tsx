import { getCategories, getProducts, getCombos } from "@/lib/data";
import MenuClient from "@/components/menu-client";
import MenuWrapper from "@/components/menu-wrapper";
import { Locale } from "@/i18n-config";


export default async function MenuPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const locale = lang as Locale;

    const categories = await getCategories(locale);
    const products = await getProducts(locale);
    const combos = await getCombos(locale);

    // Group products by category
    const productsByCategory = categories.map((cat: any) => ({
        ...cat,
        products: products.filter((p: any) => p.category === cat.name)
    }));

    const dealsTitle = locale === 'fa' ? 'پیشنهادات ویژه' : locale === 'de' ? 'Angebote' : locale === 'sv' ? 'Erbjudanden' : 'Deals';

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            position: 'relative'
        }}>
            {/* Background Gradient Orbs */}
            <div style={{
                position: 'fixed',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
                bottom: '0',
                left: '-100px',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            {/* Header - Inside Container */}
            <div className="container" style={{ paddingTop: '3rem', position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 107, 53, 0.2))',
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '50px',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '1rem',
                        color: '#ff9800'
                    }}>
                        🍕 {locale === 'sv' ? 'Meny' : locale === 'de' ? 'Speisekarte' : locale === 'fa' ? 'منو' : 'Menu'}
                    </span>
                    <h1 style={{
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: '800',
                        letterSpacing: '-1px'
                    }}>
                        {locale === 'fa' ? 'منوی ما' : locale === 'de' ? 'Unsere Speisekarte' : locale === 'sv' ? 'Vår Meny' : 'Our Menu'}
                    </h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)' }}>
                        {locale === 'fa'
                            ? 'بهترین پیتزاها با مواد اولیه تازه و با کیفیت'
                            : locale === 'sv'
                                ? 'Upptäck vårt läckra urval av pizzor gjorda med färska ingredienser.'
                                : 'Discover our delicious selection of pizzas made with fresh ingredients.'}
                    </p>
                </div>
            </div>

            {/* Category Navigation with Scroll Spy */}
            <MenuWrapper
                categories={categories}
                combos={combos}
                dealsTitle={dealsTitle}
            >
                {/* Menu Content - Inside Container */}
                <div className="container" style={{ paddingBottom: '5rem', position: 'relative', zIndex: 2 }}>
                    <MenuClient
                        lang={locale}
                        categories={categories}
                        products={products}
                        combos={combos}
                        productsByCategory={productsByCategory}
                        showCategoryNav={false}
                    />
                </div>
            </MenuWrapper>
        </div>
    );
}
