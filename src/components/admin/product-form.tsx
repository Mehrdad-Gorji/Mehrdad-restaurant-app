'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/image-upload';

export default function ProductForm({ categories, extrasArr, predefinedSizes = [], initialData, isEdit = false }: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [price, setPrice] = useState(initialData?.price || 0);
    const [image, setImage] = useState(initialData?.image || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');

    // Tags State
    const [isSpicy, setIsSpicy] = useState(initialData?.isSpicy || false);
    const [isVegetarian, setIsVegetarian] = useState(initialData?.isVegetarian || false);
    const [isGlutenFree, setIsGlutenFree] = useState(initialData?.isGlutenFree || false);
    const [isVegan, setIsVegan] = useState(initialData?.isVegan || false);

    // Homepage Display
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
    const [isTrending, setIsTrending] = useState(initialData?.isTrending || false);

    // Translations State
    const getInitialTrans = (lang: string) => {
        const t = initialData?.translations?.find((tr: any) => tr.language === lang);
        return { name: t?.name || '', description: t?.description || '' };
    };

    const [translations, setTranslations] = useState({
        en: getInitialTrans('en'),
        sv: getInitialTrans('sv'),
        de: getInitialTrans('de'),
        fa: getInitialTrans('fa')
    });

    const [selectedExtras, setSelectedExtras] = useState<string[]>(
        initialData?.extras?.map((e: any) => e.extraId) || []
    );

    const [sizes, setSizes] = useState(
        initialData?.sizes?.length > 0 ? initialData.sizes.map((s: any) => ({
            name: s.translations[0]?.name || 'Standard',
            priceModifier: s.priceModifier
        })) : [{ name: 'Standard', priceModifier: 0 }]
    );

    const handleTranslationChange = (lang: string, field: string, value: string) => {
        setTranslations(prev => ({
            ...prev,
            [lang]: {
                ...prev[lang as keyof typeof translations],
                [field]: value
            }
        }));
    };

    const toggleExtra = (id: string) => {
        if (selectedExtras.includes(id)) {
            setSelectedExtras(prev => prev.filter(e => e !== id));
        } else {
            setSelectedExtras(prev => [...prev, id]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            slug,
            price,
            image,
            categoryId,
            isSpicy,
            isVegetarian,
            isGlutenFree,
            isVegan,
            isFeatured,
            isTrending,
            translations: Object.entries(translations).map(([lang, data]) => ({
                language: lang,
                name: data.name,
                description: data.description
            })),
            sizes: sizes.map((s: { name: string; priceModifier: number }) => ({
                priceModifier: Number(s.priceModifier),
                translations: [
                    { language: 'en', name: s.name },
                    { language: 'sv', name: s.name },
                    { language: 'de', name: s.name },
                    { language: 'fa', name: s.name }
                ]
            })),
            extras: selectedExtras
        };

        const url = isEdit ? `/api/admin/products/${initialData.id}` : '/api/admin/products';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/admin/products');
                router.refresh();
            } else {
                const err = await res.json();
                alert(`Failed to save product: ${err.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            alert('An unexpected error occurred');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        setLoading(true);
        const res = await fetch(`/api/admin/products/${initialData.id}`, { method: 'DELETE' });
        if (res.ok) {
            router.push('/admin/products');
            router.refresh();
        } else {
            alert('Failed to delete');
            setLoading(false);
        }
    };

    // Shared Styles
    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500' as const
    };

    const sectionStyle = {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.05)'
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{
                        marginTop: 0,
                        marginBottom: '0.5rem',
                        fontSize: '2rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                        {isEdit ? 'Update your product details' : 'Create a new item for your menu'}
                    </p>
                </div>

                {isEdit && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>🗑️</span> Delete
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Main Info */}
                <div style={sectionStyle}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '0.5rem', borderRadius: '10px', fontSize: '1rem' }}>📝</span>
                        Basic Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Slug (Unique ID) *</label>
                            <input
                                required
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="e.g. pepperoni-pizza"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Base Price (SEK) *</label>
                            <input
                                required
                                type="number"
                                value={price}
                                onChange={e => setPrice(Number(e.target.value))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Category *</label>
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                            >
                                <option value="" style={{ background: '#1a1a2e' }}>Select Category</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>
                                        {c.slug}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Product Image</label>
                            <ImageUpload value={image} onChange={setImage} />
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div style={sectionStyle}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '0.5rem', borderRadius: '10px', fontSize: '1rem' }}>🏷️</span>
                        Tags & Dietary
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {[
                            { key: 'isSpicy', label: '🌶️ Spicy', color: '#f87171', state: isSpicy, setState: setIsSpicy },
                            { key: 'isVegetarian', label: '🥦 Vegetarian', color: '#34d399', state: isVegetarian, setState: setIsVegetarian },
                            { key: 'isGlutenFree', label: '🌾 Gluten Free', color: '#fbbf24', state: isGlutenFree, setState: setIsGlutenFree },
                            { key: 'isVegan', label: '🌱 Vegan', color: '#a78bfa', state: isVegan, setState: setIsVegan },
                            { key: 'isFeatured', label: '⭐ Featured', color: '#fcd34d', state: isFeatured, setState: setIsFeatured },
                            { key: 'isTrending', label: '🔥 Trending', color: '#f472b6', state: isTrending, setState: setIsTrending }
                        ].map(({ key, label, color, state, setState }) => (
                            <label key={key} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1.25rem',
                                background: state ? `${color}26` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${state ? color : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                color: state ? color : 'rgba(255,255,255,0.7)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={state}
                                    onChange={e => setState(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: color }}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Translation Grid */}
                <div style={sectionStyle}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.5rem', borderRadius: '10px', fontSize: '1rem' }}>🌍</span>
                        Translations
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { lang: 'en', label: 'English', flag: '🇬🇧' },
                            { lang: 'sv', label: 'Swedish', flag: '🇸🇪' },
                            { lang: 'de', label: 'German', flag: '🇩🇪' },
                            { lang: 'fa', label: 'Persian', flag: '🇮🇷' }
                        ].map(({ lang, label, flag }) => (
                            <div key={lang} style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                padding: '1.25rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1rem',
                                    color: 'rgba(255,255,255,0.8)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>{flag}</span> {label}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <input
                                        placeholder="Product Name"
                                        value={(translations as any)[lang].name}
                                        onChange={(e) => handleTranslationChange(lang, 'name', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <textarea
                                        placeholder="Description..."
                                        value={(translations as any)[lang].description}
                                        onChange={(e) => handleTranslationChange(lang, 'description', e.target.value)}
                                        rows={3}
                                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sizes */}
                <div style={sectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '0.5rem', borderRadius: '10px', fontSize: '1rem' }}>📏</span>
                            Sizes & Prices
                        </h3>
                        <button
                            type="button"
                            onClick={() => setSizes([...sizes, { name: '', priceModifier: 0 }])}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem'
                            }}
                        >
                            + Add Size
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {sizes.map((size: any, idx: number) => (
                            <div key={idx} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 140px 40px',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        value={predefinedSizes.includes(size.name) ? size.name : (size.name ? '__custom__' : '')}
                                        onChange={e => {
                                            const newSizes = [...sizes];
                                            if (e.target.value === '__custom__') {
                                                newSizes[idx].name = ''; // Clear for custom input
                                            } else {
                                                newSizes[idx].name = e.target.value;
                                            }
                                            setSizes(newSizes);
                                        }}
                                        style={{ ...inputStyle, padding: '0.6rem', cursor: 'pointer' }}
                                    >
                                        <option value="" style={{ background: '#1a1a2e' }}>Select Size</option>
                                        {predefinedSizes.map((sizeName: string) => (
                                            <option key={sizeName} value={sizeName} style={{ background: '#1a1a2e' }}>{sizeName}</option>
                                        ))}
                                        <option value="__custom__" style={{ background: '#1a1a2e' }}>Custom Size...</option>
                                    </select>
                                    {(!predefinedSizes.includes(size.name) || size.name === '') && (
                                        <input
                                            placeholder="Custom Name"
                                            value={size.name}
                                            onChange={e => {
                                                const newSizes = [...sizes];
                                                newSizes[idx].name = e.target.value;
                                                setSizes(newSizes);
                                            }}
                                            style={{ ...inputStyle, padding: '0.6rem' }}
                                        />
                                    )}
                                </div>
                                <input
                                    type="number"
                                    placeholder="+ Price"
                                    value={size.priceModifier}
                                    onChange={e => {
                                        const newSizes = [...sizes];
                                        newSizes[idx].priceModifier = Number(e.target.value);
                                        setSizes(newSizes);
                                    }}
                                    style={{ ...inputStyle, padding: '0.6rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setSizes(sizes.filter((_: any, i: number) => i !== idx))}
                                    style={{
                                        background: 'transparent',
                                        color: '#f87171',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Extras */}
                <div style={sectionStyle}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '0.5rem', borderRadius: '10px', fontSize: '1rem' }}>🧀</span>
                        Allowed Extras
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        {extrasArr.map((extra: any) => (
                            <label key={extra.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                border: `1px solid ${selectedExtras.includes(extra.id) ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: selectedExtras.includes(extra.id) ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                                color: selectedExtras.includes(extra.id) ? '#a5b4fc' : 'rgba(255,255,255,0.7)',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={selectedExtras.includes(extra.id)}
                                    onChange={() => toggleExtra(extra.id)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                                />
                                <span>
                                    {extra.translations[0]?.name || extra.id}
                                    <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: '0.3rem' }}>(+{extra.price})</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Action Bar */}
                <div style={{
                    position: 'sticky',
                    bottom: '2rem',
                    background: 'rgba(26, 26, 46, 0.9)',
                    backdropFilter: 'blur(10px)',
                    padding: '1rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    boxShadow: '0 -5px 20px rgba(0,0,0,0.2)'
                }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{
                            padding: '0.85rem 2rem',
                            background: 'transparent',
                            color: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.85rem 3rem',
                            background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Saving...' : isEdit ? '💾 Update Product' : '✨ Create Product'}
                    </button>
                </div>

            </form>
        </div>
    );
}
