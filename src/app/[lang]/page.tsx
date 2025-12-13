import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import SpecialOccasionWidget from '@/components/themes/special-occasion-widget';

import FeaturedOffers from '@/components/featured-offers';
import HeroSearch from '@/components/hero-search';
import HomepageProductCard from '@/components/homepage-product-card';
import { unstable_noStore as noStore } from 'next/cache';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  // Disable cache to get fresh settings
  noStore();

  // Fetch Theme Settings
  let activeTheme = 'NONE';
  let customTitle = undefined;
  let customSubtitle = undefined;
  let customButtonText = undefined;
  let customBadge = undefined;

  try {
    const themeSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'active_theme',
            'theme_custom_title',
            'theme_custom_subtitle',
            'theme_custom_button',
            'theme_custom_badge',
            'theme_custom_image',
            'theme_custom_color',
            'theme_custom_opacity',
            'theme_custom_icon'
          ]
        }
      }
    });

    const theme = themeSettings.find(s => s.key === 'active_theme');
    if (theme) activeTheme = theme.value;

    customTitle = themeSettings.find(s => s.key === 'theme_custom_title')?.value;
    customSubtitle = themeSettings.find(s => s.key === 'theme_custom_subtitle')?.value;
    customButtonText = themeSettings.find(s => s.key === 'theme_custom_button')?.value;
    customBadge = themeSettings.find(s => s.key === 'theme_custom_badge')?.value;

    // New Custom Theme Props
    var customImage = themeSettings.find(s => s.key === 'theme_custom_image')?.value;
    var customColor = themeSettings.find(s => s.key === 'theme_custom_color')?.value;
    var customOpacity = themeSettings.find(s => s.key === 'theme_custom_opacity')?.value;
    var customIcon = themeSettings.find(s => s.key === 'theme_custom_icon')?.value;

  } catch (e) {
    console.warn('Failed to fetch theme settings', e);
  }

  // Fetch Data (Server Components)
  const categories = await prisma.category.findMany({
    include: { translations: true },
    take: 6
  });

  // Fetch Featured Products (marked as featured, or fallback to latest)
  let featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    include: {
      translations: true,
      sizes: { include: { translations: true } },
      extras: { include: { extra: { include: { translations: true } } } }
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  });
  // Fallback to latest if no featured products
  if (featuredProducts.length === 0) {
    featuredProducts = await prisma.product.findMany({
      include: {
        translations: true,
        sizes: { include: { translations: true } },
        extras: { include: { extra: { include: { translations: true } } } }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Fetch Trending Products (marked as trending, or fallback to latest)
  let trendingProducts = await prisma.product.findMany({
    where: { isTrending: true },
    include: {
      translations: true,
      sizes: { include: { translations: true } },
      extras: { include: { extra: { include: { translations: true } } } }
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  });
  // Fallback to latest if no trending products
  if (trendingProducts.length === 0) {
    trendingProducts = await prisma.product.findMany({
      include: {
        translations: true,
        sizes: { include: { translations: true } },
        extras: { include: { extra: { include: { translations: true } } } }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Fetch Site Settings
  let settings = null;
  try {
    // @ts-ignore
    settings = await prisma.siteSettings.findFirst();
  } catch (e) {
    console.error("Failed to fetch settings", e);
  }

  // Fetch Active Offers for Homepage
  let featuredOffers = [];
  try {
    // @ts-ignore
    featuredOffers = await prisma.offer.findMany({
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
      orderBy: { createdAt: 'desc' },
      take: 3 // Limit to Top 3
    });

    // Transform translations
    featuredOffers = featuredOffers.map((offer: any) => {
      const t = offer.translations.find((tr: any) => tr.language === lang) || {};
      return {
        ...offer,
        title: t.title || offer.title,
        description: t.description || offer.description
      };
    });
  } catch (e) {
    console.error("Failed to fetch homepage offers", e);
  }

  const heroTitle = settings?.heroTitle || dict.hero?.title || 'Delicious Pizza Delivered';
  const heroDesc = settings?.heroDescription || dict.hero?.description || 'Authentic Italian flavors delivered straight to your doorstep.';

  const bgImage = settings?.heroImage
    ? (settings.heroImage.startsWith('/') || settings.heroImage.startsWith('http') ? settings.heroImage : `/api/uploads/${settings.heroImage}`)
    : '/uploads/hero-bg.png';

  // Prepare searchable products for hero search
  const allProducts = await prisma.product.findMany({
    include: { translations: true },
    take: 50
  });
  const searchableProducts = allProducts.map((p: any) => {
    const t = p.translations.find((tr: any) => tr.language === lang) || p.translations[0] || {};
    return {
      id: p.id,
      slug: p.slug,
      name: t.name || p.slug,
      price: Number(p.price),
      image: p.image
    };
  });


  return (
    <div className={styles.page}>


      <main>
        {/* HERO SECTION */}
        <section style={{
          position: 'relative',
          height: '65vh', // Reduced from 85vh
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          background: '#1a1a1a' // Fallback color
        }}>
          {/* Background Image with Overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }} />

          {/* Dark Gradient Overlay for Readability */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
            zIndex: 1
          }} />

          {/* Elegant Wave Separator with Glow */}
          <div style={{
            position: 'absolute',
            bottom: '-1px',
            left: 0,
            right: 0,
            zIndex: 3,
            overflow: 'hidden'
          }}>
            {/* Glowing Line Effect */}
            <div style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              maxWidth: '800px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,152,0,0.6) 20%, rgba(255,107,107,0.8) 50%, rgba(255,152,0,0.6) 80%, transparent 100%)',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(255,152,0,0.5), 0 0 40px rgba(255,107,107,0.3), 0 0 60px rgba(255,152,0,0.2)',
              filter: 'blur(1px)'
            }} />
            {/* Curved Wave SVG */}
            <svg
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              style={{
                display: 'block',
                width: '100%',
                height: '80px'
              }}
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(10,10,10,0)" />
                  <stop offset="40%" stopColor="rgba(10,10,10,0.5)" />
                  <stop offset="100%" stopColor="#0a0a0a" />
                </linearGradient>
              </defs>
              <path
                d="M0,40 C360,120 720,0 1080,60 C1260,90 1380,70 1440,50 L1440,120 L0,120 Z"
                fill="url(#waveGradient)"
              />
              <path
                d="M0,60 C360,100 720,20 1080,70 C1260,95 1380,80 1440,60 L1440,120 L0,120 Z"
                fill="#0a0a0a"
              />
            </svg>
          </div>

          <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 2 }}>
            <span style={{
              display: 'inline-block',
              padding: '0.4rem 1.2rem',
              background: 'var(--primary)', // Solid primary color
              color: 'white',
              borderRadius: '50px',
              fontWeight: '700',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
            }}>
              {dict.hero?.subtitle || 'The Best in Town'}
            </span>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', // Slightly smaller max size
              lineHeight: '1.1',
              marginBottom: '1rem',
              letterSpacing: '-2px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              color: settings?.heroTitleColor || '#FFFFFF'
            }}>
              {heroTitle}
            </h1>

            <p style={{
              fontSize: '1.15rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
              color: 'rgba(255, 255, 255, 0.9)', // Lighter text
              textShadow: '0 1px 4px rgba(0,0,0,0.5)'
            }}>
              {heroDesc}
            </p>

            {/* Search Bar with Autocomplete */}
            <HeroSearch
              lang={lang}
              placeholder={dict.hero?.searchPlaceholder || "Search for pizza, pasta..."}
              products={searchableProducts}
            />

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href={`/${lang}/menu`} className="btn btn-primary" style={{ minWidth: '150px' }}>
                {dict.hero?.cta || 'View Menu'}
              </Link>
              <Link href={`/${lang}/offers`} className="btn" style={{
                minWidth: '150px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'white',
                backdropFilter: 'blur(5px)'
              }}>
                Offers
              </Link>
            </div>
          </div>
        </section>

        {/* SPECIAL OCCASION WIDGET */}
        {/* SPECIAL OCCASION WIDGET */}
        <div style={{ width: '100%' }}>
          <SpecialOccasionWidget
            theme={activeTheme}
            lang={lang}
            mode="banner"
            customTitle={customTitle}
            customSubtitle={customSubtitle}
            customButtonText={customButtonText}
            customBadge={customBadge}
            customImage={customImage}
            customColor={customColor}
            customOpacity={customOpacity ? parseInt(customOpacity) : 100}
            customIcon={customIcon}
          />
        </div>

        {/* FEATURED OFFERS SECTION */}
        <FeaturedOffers offers={featuredOffers} lang={lang} dict={dict} />

        {/* FEATURED PRODUCTS SECTION - Modern Dark Theme */}
        <section style={{
          padding: '8rem 0',
          background: '#0a0a0a',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Gradient Orbs */}
          <div style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.12) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
            filter: 'blur(80px)'
          }} />
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
            bottom: '-50px',
            left: '-50px',
            filter: 'blur(60px)'
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.2))',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '50px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '1rem',
                  color: '#ffc107'
                }}>
                  ⭐ {dict?.home?.featured?.badge || 'Featured'}
                </span>
                <h2 style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  marginBottom: '0.5rem',
                  color: '#fff',
                  fontWeight: '800',
                  letterSpacing: '-1px'
                }}>{dict?.home?.featured?.title || 'Our Bestsellers'}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
                  {dict?.home?.featured?.subtitle || 'The most popular choices from our customers'}
                </p>
              </div>
              <Link href={`/${lang}/menu`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50px',
                color: '#fff',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}>
                {dict?.home?.featured?.viewAll || 'View All'} <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #ffc107, #ff9800)',
                  borderRadius: '50%',
                  fontSize: '0.8rem'
                }}>→</span>
              </Link>
            </div>

            <div className="products-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {featuredProducts.map((product: any) => {
                const t = product.translations.find((tr: any) => tr.language === lang) || product.translations[0] || {};
                const formattedProduct = {
                  id: product.id,
                  slug: product.slug,
                  name: t.name || product.slug,
                  description: t.description || '',
                  price: Number(product.price),
                  image: product.image,
                  sizes: product.sizes?.map((s: any) => ({
                    id: s.id,
                    name: s.translations?.find((st: any) => st.language === lang)?.name || 'Standard',
                    priceModifier: Number(s.priceModifier)
                  })) || [],
                  extras: product.extras?.map((pe: any) => {
                    const et = pe.extra?.translations?.find((et: any) => et.language === lang) || {};
                    return {
                      id: pe.extra?.id || pe.extraId,
                      name: et.name || 'Extra',
                      price: Number(pe.extra?.price || 0),
                      image: pe.extra?.image
                    };
                  }) || []
                };
                return (
                  <HomepageProductCard key={product.id} product={formattedProduct} lang={lang} />
                );
              })}
            </div>
          </div>
        </section>

        {/* TRENDING SECTION - Modern Dark Theme */}
        <section style={{
          padding: '8rem 0',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Background Elements */}
          <div style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
            bottom: '-150px',
            left: '-100px',
            filter: 'blur(80px)'
          }} />
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            top: '10%',
            right: '10%',
            filter: 'blur(60px)'
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 83, 0.2))',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                padding: '0.6rem 1.5rem',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '1.5rem',
                color: '#FF6B6B'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: '#FF6B6B',
                  borderRadius: '50%'
                }} />
                {dict?.home?.trending?.badge || 'Hot Right Now'}
              </span>
              <h2 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                color: '#fff',
                fontWeight: '800',
                marginBottom: '1rem',
                letterSpacing: '-1px'
              }}>{dict?.home?.trending?.title || 'Trending Products'} 🔥</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                {dict?.home?.trending?.subtitle || "Our most popular items that customers can't stop ordering"}
              </p>
            </div>

            <div className="products-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {trendingProducts.map((product: any) => {
                const t = product.translations.find((tr: any) => tr.language === lang) || product.translations[0] || {};
                const formattedProduct = {
                  id: product.id,
                  slug: product.slug,
                  name: t.name || product.slug,
                  description: t.description || '',
                  price: Number(product.price),
                  image: product.image,
                  sizes: product.sizes?.map((s: any) => ({
                    id: s.id,
                    name: s.translations?.find((st: any) => st.language === lang)?.name || 'Standard',
                    priceModifier: Number(s.priceModifier)
                  })) || [],
                  extras: product.extras?.map((pe: any) => {
                    const et = pe.extra?.translations?.find((et: any) => et.language === lang) || {};
                    return {
                      id: pe.extra?.id || pe.extraId,
                      name: et.name || 'Extra',
                      price: Number(pe.extra?.price || 0),
                      image: pe.extra?.image
                    };
                  }) || []
                };
                return (
                  <HomepageProductCard key={product.id} product={formattedProduct} lang={lang} />
                );
              })}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
