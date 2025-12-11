'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import ProductCard from './product-card';
import ComboCard from './combo-card';
import MenuSearch from './menu-search';
import { isShopOpen } from '@/lib/shop-status';

interface MenuClientProps {
    lang: string;
    categories: any[];
    products: any[];
    combos: any[];
    productsByCategory: any[];
    showCategoryNav?: boolean;
}

const DAY_LABELS: Record<string, Record<string, string>> = {
    monday: { en: 'Monday', sv: 'Måndag', de: 'Montag', fa: 'دوشنبه' },
    tuesday: { en: 'Tuesday', sv: 'Tisdag', de: 'Dienstag', fa: 'سه‌شنبه' },
    wednesday: { en: 'Wednesday', sv: 'Onsdag', de: 'Mittwoch', fa: 'چهارشنبه' },
    thursday: { en: 'Thursday', sv: 'Torsdag', de: 'Donnerstag', fa: 'پنج‌شنبه' },
    friday: { en: 'Friday', sv: 'Fredag', de: 'Freitag', fa: 'جمعه' },
    saturday: { en: 'Saturday', sv: 'Lördag', de: 'Samstag', fa: 'شنبه' },
    sunday: { en: 'Sunday', sv: 'Söndag', de: 'Sonntag', fa: 'یک‌شنبه' },
};

function getDayLabel(key: string, lang: string) {
    const labels = DAY_LABELS[key.toLowerCase()];
    if (!labels) return key;
    return labels[lang] || labels['en'] || key;
}

function ShopClosedModal({ lang, shopStatus, shopSchedule, closedText, onClose }: any) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Disable scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999999, // Very high z-index
            backdropFilter: 'blur(5px)',
            padding: '1rem'
        }}>
            <div style={{
                background: '#1a1a1a',
                border: '1px solid rgba(255,152,0,0.3)',
                borderRadius: '24px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#aaa',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >✕</button>

                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😴</div>
                <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                    {closedText?.title || (lang === 'fa' ? 'فروشگاه بسته است' : 'Store is Closed')}
                </h2>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                    {closedText?.message || shopStatus.message}
                </p>

                {Object.keys(shopSchedule).length > 0 && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'left',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ color: '#ff9800', fontSize: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                            {closedText?.hoursLabel || (lang === 'fa' ? 'ساعات کاری' : 'Operating Hours')}
                        </h3>
                        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                            {[
                                { key: 'monday' },
                                { key: 'tuesday' },
                                { key: 'wednesday' },
                                { key: 'thursday' },
                                { key: 'friday' },
                                { key: 'saturday' },
                                { key: 'sunday' },
                            ].map(day => {
                                const sch = shopSchedule[day.key];
                                const dayLabel = getDayLabel(day.key, lang);
                                return (
                                    <div key={day.key} style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span>{dayLabel}</span>
                                        <span style={{ color: sch?.isOpen ? '#4ade80' : '#ef4444' }}>
                                            {sch?.isOpen ? `${sch.open} - ${sch.close}` : (lang === 'fa' ? 'بسته' : 'Closed')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        width: '100%',
                        transition: '0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#444'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#333'}
                >
                    {closedText?.btn || (lang === 'fa' ? 'متوجه شدم (فقط مشاهده منو)' : 'Browse Menu Only')}
                </button>
            </div>
        </div>,
        document.body
    );
}

function MenuClientContent({ lang, categories, products, combos, productsByCategory, showCategoryNav = true }: MenuClientProps) {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Shop Status (Global Banner & Modal)
    const [shopStatus, setShopStatus] = useState<{ isOpen: boolean; message: string }>({ isOpen: true, message: '' });
    const [shopSchedule, setShopSchedule] = useState<Record<string, any>>({});
    const [showClosedModal, setShowClosedModal] = useState(false);
    const [closedText, setClosedText] = useState<any>(null);


    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    const status = isShopOpen(data.operatingSchedule, data.scheduleEnabled ?? false);
                    setShopStatus(status);

                    if (data.operatingSchedule && data.operatingSchedule !== '{}') {
                        try {
                            setShopSchedule(JSON.parse(data.operatingSchedule));
                            setShopSchedule(JSON.parse(data.operatingSchedule));
                        } catch { }
                    }

                    if (data.closedTitle || data.closedMessage) {
                        setClosedText({
                            title: data.closedTitle,
                            message: data.closedMessage,
                            btn: data.closedBtnText,
                            hoursLabel: data.closedHoursText
                        });
                    }

                    if (!status.isOpen) {
                        setShowClosedModal(true);
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchStatus();
    }, []);

    // Check for search param on mount
    useEffect(() => {
        const q = searchParams.get('search');
        if (q) {
            setSearchQuery(q);
            handleSearch(q);
        }
    }, []);

    const [filters, setFilters] = useState({
        spicy: false,
        vegetarian: false,
        glutenFree: false,
        vegan: false,
        selectedCategory: '',
        sortBy: 'default' as 'default' | 'price_asc' | 'price_desc' | 'name'
    });

    const toggleFilter = (key: keyof typeof filters) => {
        if (key === 'selectedCategory' || key === 'sortBy') return;
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // Effect to handle filtering (both search and tags)
    useEffect(() => {
        let filtered = products;

        // 1. Search Filter
        if (searchQuery.trim().length > 0) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter((p: any) =>
                p.name?.toLowerCase().includes(lower) ||
                p.description?.toLowerCase().includes(lower)
            );
        }

        // 2. Tag Filters
        if (filters.spicy) filtered = filtered.filter((p: any) => p.isSpicy);
        if (filters.vegetarian) filtered = filtered.filter((p: any) => p.isVegetarian);
        if (filters.glutenFree) filtered = filtered.filter((p: any) => p.isGlutenFree);
        if (filters.vegan) filtered = filtered.filter((p: any) => p.isVegan);

        // 3. Category Filter
        if (filters.selectedCategory) {
            filtered = filtered.filter((p: any) => p.category === filters.selectedCategory);
        }

        // 4. Sort
        if (filters.sortBy === 'price_asc') {
            filtered = [...filtered].sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        } else if (filters.sortBy === 'price_desc') {
            filtered = [...filtered].sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
        } else if (filters.sortBy === 'name') {
            filtered = [...filtered].sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        }

        setFilteredProducts(filtered);

        // Show search results view if any filter is active
        const isFilterActive: boolean = searchQuery.trim().length > 0 ||
            filters.spicy || filters.vegetarian || filters.glutenFree || filters.vegan ||
            !!filters.selectedCategory || filters.sortBy !== 'default';
        setShowSearchResults(isFilterActive);

    }, [searchQuery, filters, products]);

    const dealsTitle = lang === 'fa' ? 'پیشنهادات ویژه' : lang === 'de' ? 'Angebote' : lang === 'sv' ? 'Erbjudanden' : 'Deals';
    const searchResultsTitle = lang === 'fa' ? 'نتایج جستجو' : lang === 'de' ? 'Suchergebnisse' : lang === 'sv' ? 'Sökresultat' : 'Search Results';

    return (
        <>
            {/* Shop Closed Modal */}
            {showClosedModal && (
                <ShopClosedModal
                    lang={lang}
                    shopStatus={shopStatus}
                    shopSchedule={shopSchedule}
                    closedText={closedText}
                    onClose={() => setShowClosedModal(false)}
                />
            )}

            {/* Global Shop Closed Banner */}
            {!shopStatus.isOpen && (
                <div style={{
                    background: '#ef4444',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '0.75rem',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                    marginBottom: '1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <span>⚠️</span>
                    <span>{shopStatus.message || (lang === 'fa' ? 'مغازه بسته است' : 'Store is closed')}</span>
                </div>
            )}

            {/* Search Bar */}
            <MenuSearch lang={lang} onSearch={handleSearch} initialQuery={searchQuery} />

            {/* Category and Sort Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
                padding: '0 1rem'
            }}>
                {/* Category Dropdown */}
                <select
                    value={filters.selectedCategory}
                    onChange={(e) => setFilters(prev => ({ ...prev, selectedCategory: e.target.value }))}
                    style={{
                        background: filters.selectedCategory ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: filters.selectedCategory ? '1px solid rgba(255, 152, 0, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50px',
                        padding: '0.5rem 1.25rem',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minWidth: '150px'
                    }}
                >
                    <option value="" style={{ background: '#1a1a1a' }}>
                        📁 {lang === 'fa' ? 'همه دسته‌ها' : lang === 'sv' ? 'Alla kategorier' : lang === 'de' ? 'Alle Kategorien' : 'All Categories'}
                    </option>
                    {categories.map((cat: any) => (
                        <option key={cat.id || cat.slug} value={cat.name} style={{ background: '#1a1a1a' }}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                {/* Sort Dropdown */}
                <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    style={{
                        background: filters.sortBy !== 'default' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: filters.sortBy !== 'default' ? '1px solid rgba(255, 152, 0, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50px',
                        padding: '0.5rem 1.25rem',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minWidth: '150px'
                    }}
                >
                    <option value="default" style={{ background: '#1a1a1a' }}>
                        🔄 {lang === 'fa' ? 'مرتب‌سازی' : lang === 'sv' ? 'Sortera' : lang === 'de' ? 'Sortieren' : 'Sort By'}
                    </option>
                    <option value="name" style={{ background: '#1a1a1a' }}>
                        🔤 {lang === 'fa' ? 'نام' : lang === 'sv' ? 'Namn' : lang === 'de' ? 'Name' : 'Name'}
                    </option>
                    <option value="price_asc" style={{ background: '#1a1a1a' }}>
                        💰 {lang === 'fa' ? 'قیمت: کم به زیاد' : lang === 'sv' ? 'Pris: Lågt-Högt' : lang === 'de' ? 'Preis: Niedrig-Hoch' : 'Price: Low-High'}
                    </option>
                    <option value="price_desc" style={{ background: '#1a1a1a' }}>
                        💎 {lang === 'fa' ? 'قیمت: زیاد به کم' : lang === 'sv' ? 'Pris: Högt-Lågt' : lang === 'de' ? 'Preis: Hoch-Niedrig' : 'Price: High-Low'}
                    </option>
                </select>

                {/* Clear All Filters */}
                {(filters.selectedCategory || filters.sortBy !== 'default' || filters.spicy || filters.vegetarian || filters.glutenFree || filters.vegan || searchQuery) && (
                    <button
                        onClick={() => {
                            setFilters({
                                spicy: false,
                                vegetarian: false,
                                glutenFree: false,
                                vegan: false,
                                selectedCategory: '',
                                sortBy: 'default'
                            });
                            setSearchQuery('');
                        }}
                        style={{
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '50px',
                            padding: '0.5rem 1.25rem',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        ✕ {lang === 'fa' ? 'پاک کردن' : lang === 'sv' ? 'Rensa' : lang === 'de' ? 'Löschen' : 'Clear'}
                    </button>
                )}
            </div>

            {/* Smart Filters Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '2rem',
                padding: '0 1rem'
            }}>
                {[
                    { key: 'spicy', label: '🌶️ ' + (lang === 'fa' ? 'تند' : 'Spicy') },
                    { key: 'vegetarian', label: '🥦 ' + (lang === 'fa' ? 'گیاهی' : 'Vegetarian') },
                    { key: 'glutenFree', label: '🌾 ' + (lang === 'fa' ? 'بدون گلوتن' : 'Gluten Free') },
                    { key: 'vegan', label: '🌱 ' + (lang === 'fa' ? 'وگان' : 'Vegan') },
                ].map((f: any) => (
                    <button
                        key={f.key}
                        onClick={() => toggleFilter(f.key)}
                        style={{
                            background: filters[f.key as 'spicy' | 'vegetarian' | 'glutenFree' | 'vegan'] ? '#ff9800' : 'rgba(255,255,255,0.1)',
                            color: filters[f.key as 'spicy' | 'vegetarian' | 'glutenFree' | 'vegan'] ? '#000' : '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50px',
                            padding: '0.5rem 1.25rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: filters[f.key as 'spicy' | 'vegetarian' | 'glutenFree' | 'vegan'] ? '0 4px 12px rgba(255,152,0,0.4)' : 'none'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Show search results or category view */}
            {showSearchResults ? (
                <section style={{ marginBottom: '5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,152,0,0.3), transparent)' }}></div>
                        <h2 style={{
                            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                            color: '#fff',
                            margin: 0,
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span style={{ color: '#ff9800' }}>🔍</span> {searchResultsTitle}
                            <span style={{
                                fontSize: '1rem',
                                color: 'rgba(255,255,255,0.5)',
                                fontWeight: '400'
                            }}>
                                ({filteredProducts.length})
                            </span>
                        </h2>
                        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,152,0,0.3), transparent)' }}></div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <p style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            color: 'rgba(255,255,255,0.5)'
                        }}>
                            {lang === 'fa' ? 'محصولی یافت نشد' : lang === 'sv' ? 'Inga produkter hittades.' : 'No products found.'}
                        </p>
                    ) : (
                        <div className="products-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            {filteredProducts.map((p: any) => (
                                <ProductCard key={p.id} product={p} lang={lang} />
                            ))}
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {/* Category Navigation - Only show if showCategoryNav is true */}
                    {showCategoryNav && (
                        <div style={{
                            position: 'sticky',
                            top: '70px',
                            zIndex: 90,
                            background: 'rgba(10, 10, 10, 0.95)',
                            backdropFilter: 'blur(20px)',
                            padding: '1rem 0',
                            marginBottom: '3rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            marginLeft: 'calc(-50vw + 50%)',
                            marginRight: 'calc(-50vw + 50%)',
                            width: '100vw',
                            boxSizing: 'border-box'
                        }}>
                            <div
                                className="hide-scrollbar"
                                style={{
                                    display: 'flex',
                                    flexWrap: 'nowrap',
                                    gap: '1.5rem',
                                    overflowX: 'scroll',
                                    overflowY: 'hidden',
                                    padding: '0.5rem 2rem 1rem',
                                    WebkitOverflowScrolling: 'touch'
                                }}>
                                {/* Deals Circle */}
                                {combos.length > 0 && (
                                    <a href="#deals" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        textDecoration: 'none',
                                        flexShrink: 0,
                                        minWidth: '80px'
                                    }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 20px rgba(255, 152, 0, 0.4)',
                                            border: '3px solid rgba(255,255,255,0.2)'
                                        }}>
                                            <span style={{ fontSize: '1.8rem' }}>🔥</span>
                                        </div>
                                        <span style={{
                                            color: '#ff9800',
                                            fontWeight: '600',
                                            fontSize: '0.8rem',
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap'
                                        }}>{dealsTitle}</span>
                                    </a>
                                )}

                                {/* Category Circles */}
                                {categories.map((cat: any) => (
                                    <a key={cat.id} href={`#${cat.slug}`} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        textDecoration: 'none',
                                        flexShrink: 0,
                                        minWidth: '70px'
                                    }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            background: cat.image
                                                ? `url(${cat.image}) center/cover`
                                                : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '3px solid rgba(255,255,255,0.15)',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                            overflow: 'hidden'
                                        }}>
                                            {!cat.image && (
                                                <span style={{ fontSize: '1.8rem', opacity: 0.5 }}>🍕</span>
                                            )}
                                        </div>
                                        <span style={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontWeight: '500',
                                            fontSize: '0.8rem',
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap'
                                        }}>{cat.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deals Section */}
                    {combos.length > 0 && (
                        <section id="deals" style={{ marginBottom: '5rem', scrollMarginTop: '160px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,152,0,0.3), transparent)' }}></div>
                                <h2 style={{
                                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                                    color: '#fff',
                                    margin: 0,
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <span style={{ color: '#ff9800' }}>🔥</span> {dealsTitle}
                                </h2>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,152,0,0.3), transparent)' }}></div>
                            </div>
                            <div className="products-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '2rem'
                            }}>
                                {combos.map((c: any) => (
                                    <ComboCard key={c.id} combo={c} lang={lang} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Category Sections */}
                    {productsByCategory.map((cat: any) => (
                        <section key={cat.id} id={cat.slug} style={{ marginBottom: '5rem', scrollMarginTop: '160px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}></div>
                                <h2 style={{
                                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                                    color: '#fff',
                                    margin: 0,
                                    fontWeight: '700'
                                }}>
                                    {cat.name}
                                </h2>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}></div>
                            </div>

                            {cat.products.length === 0 ? (
                                <p style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    color: 'rgba(255,255,255,0.5)'
                                }}>
                                    {lang === 'fa' ? 'بدون محصول' : lang === 'sv' ? 'Inga produkter tillgängliga i denna kategori.' : 'No products available in this category.'}
                                </p>
                            ) : (
                                <div className="products-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '2rem'
                                }}>
                                    {cat.products.map((p: any) => (
                                        <ProductCard key={p.id} product={p} lang={lang} />
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </>
            )}
        </>
    );
}

export default function MenuClient(props: MenuClientProps) {
    return (
        <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading...</div>}>
            <MenuClientContent {...props} />
        </Suspense>
    );
}
