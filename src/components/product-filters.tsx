'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductFiltersProps {
    categories: any[];
    lang?: string;
}

export default function ProductFilters({ categories, lang = 'en' }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.get('categories')?.split(',').filter(Boolean) || []
    );
    const [priceRange, setPriceRange] = useState({
        min: parseInt(searchParams.get('minPrice') || '0'),
        max: parseInt(searchParams.get('maxPrice') || '500')
    });
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
    const [isOpen, setIsOpen] = useState(false);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedCategories.length > 0) {
            params.set('categories', selectedCategories.join(','));
        } else {
            params.delete('categories');
        }

        if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
        else params.delete('minPrice');

        if (priceRange.max < 500) params.set('maxPrice', priceRange.max.toString());
        else params.delete('maxPrice');

        if (sortBy !== 'name') params.set('sort', sortBy);
        else params.delete('sort');

        router.push(`?${params.toString()}`, { scroll: false });
    }, [selectedCategories, priceRange, sortBy]);

    const toggleCategory = (categorySlug: string) => {
        setSelectedCategories(prev =>
            prev.includes(categorySlug)
                ? prev.filter(c => c !== categorySlug)
                : [...prev, categorySlug]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: 0, max: 500 });
        setSortBy('name');
        router.push(window.location.pathname);
    };

    const hasActiveFilters = selectedCategories.length > 0 || priceRange.min > 0 || priceRange.max < 500 || sortBy !== 'name';

    const labels = {
        en: {
            filters: 'Filters',
            categories: 'Categories',
            priceRange: 'Price Range',
            sortBy: 'Sort By',
            clear: 'Clear All',
            apply: 'Apply Filters',
            name: 'Name',
            priceLow: 'Price: Low to High',
            priceHigh: 'Price: High to Low'
        },
        sv: {
            filters: 'Filter',
            categories: 'Kategorier',
            priceRange: 'Prisintervall',
            sortBy: 'Sortera',
            clear: 'Rensa alla',
            apply: 'Tillämpa filter',
            name: 'Namn',
            priceLow: 'Pris: Låg till Hög',
            priceHigh: 'Pris: Hög till Låg'
        },
        de: {
            filters: 'Filter',
            categories: 'Kategorien',
            priceRange: 'Preisspanne',
            sortBy: 'Sortieren',
            clear: 'Alle löschen',
            apply: 'Filter anwenden',
            name: 'Name',
            priceLow: 'Preis: Niedrig bis Hoch',
            priceHigh: 'Preis: Hoch bis Niedrig'
        },
        fa: {
            filters: 'فیلترها',
            categories: 'دسته‌بندی‌ها',
            priceRange: 'محدوده قیمت',
            sortBy: 'مرتب‌سازی',
            clear: 'پاک کردن همه',
            apply: 'اعمال فیلتر',
            name: 'نام',
            priceLow: 'قیمت: کم به زیاد',
            priceHigh: 'قیمت: زیاد به کم'
        }
    };

    const t = labels[lang as keyof typeof labels] || labels.en;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'none',
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                }}
                className="mobile-filter-toggle"
            >
                🎛️ {t.filters} {hasActiveFilters && `(${selectedCategories.length + (priceRange.min > 0 ? 1 : 0) + (priceRange.max < 500 ? 1 : 0)})`}
            </button>

            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    position: 'sticky',
                    top: '2rem'
                }}
                className={isOpen ? 'filters-open' : ''}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#fff'
                    }}>
                        🎛️ {t.filters}
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff9800',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            {t.clear}
                        </button>
                    )}
                </div>

                {/* Sort By */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                        {t.sortBy}
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="name">{t.name}</option>
                        <option value="price_asc">{t.priceLow}</option>
                        <option value="price_desc">{t.priceHigh}</option>
                    </select>
                </div>

                {/* Categories */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                        {t.categories}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {categories.map((category) => {
                            const translation = category.translations?.find((t: any) => t.language === lang);
                            const name = translation?.name || category.slug;

                            return (
                                <label
                                    key={category.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.5rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease',
                                        background: selectedCategories.includes(category.slug)
                                            ? 'rgba(255, 152, 0, 0.1)'
                                            : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selectedCategories.includes(category.slug)) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selectedCategories.includes(category.slug)) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.slug)}
                                        onChange={() => toggleCategory(category.slug)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <span style={{
                                        color: selectedCategories.includes(category.slug)
                                            ? '#ff9800'
                                            : 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '0.95rem'
                                    }}>
                                        {name}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                        {t.priceRange}: {priceRange.min} - {priceRange.max} SEK
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                            placeholder="Min"
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.9rem'
                            }}
                        />
                        <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 500 }))}
                            placeholder="Max"
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="500"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                        style={{
                            width: '100%',
                            cursor: 'pointer'
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .mobile-filter-toggle {
                        display: block !important;
                    }
                    
                    .filters-open {
                        display: block !important;
                    }
                    
                    div[style*="position: sticky"] {
                        display: none;
                    }
                    
                    div[style*="position: sticky"].filters-open {
                        display: block;
                        position: relative;
                        top: 0;
                    }
                }
            `}</style>
        </>
    );
}
