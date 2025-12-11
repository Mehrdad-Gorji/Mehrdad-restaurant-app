'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/image-upload';

import ProductPicker from './product-picker';

export default function ComboForm({ products, initialData, isEdit = false }: { products: any[], initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(initialData?.name || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price || 0);
    const [discountType, setDiscountType] = useState(initialData?.discountType || 'PERCENTAGE');
    const [discountValue, setDiscountValue] = useState(initialData?.discountValue || 0);
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [image, setImage] = useState(initialData?.image || '');
    const [autoCalculate, setAutoCalculate] = useState(!isEdit);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Transform initialItems to have correct structure
    const [items, setItems] = useState<any[]>(
        initialData?.items?.map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity,
            sizeName: it.sizeName || '',
            extrasJson: it.extrasJson ? JSON.parse(it.extrasJson) : []
        })) || []
    );

    const getProduct = (id: string) => products.find(p => p.id === id);

    const addItem = () => {
        if (products.length === 0) return;
        setItems([...items, { productId: products[0].id, quantity: 1, sizeName: '', extrasJson: [] }]);
    };

    const handlePickerSelect = (selected: any[]) => {
        const newItems = selected.map(p => ({
            productId: p.id,
            quantity: 1,
            sizeName: p.sizes?.[0]?.translations?.[0]?.name || p.sizes?.[0]?.name || '',
            extrasJson: []
        }));
        setItems([...items, ...newItems]);
        setIsPickerOpen(false);
    };

    const updateItem = (idx: number, key: string, value: any) => {
        const copy = [...items];
        copy[idx] = { ...copy[idx], [key]: value };

        // If product changes, reset size
        if (key === 'productId') {
            const p = getProduct(value);
            copy[idx].sizeName = p?.sizes?.[0]?.translations?.[0]?.name || '';
        }

        setItems(copy);
    };

    const removeItem = (idx: number) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    const calculateBasePrice = () => {
        return items.reduce((total, item) => {
            const p = getProduct(item.productId);
            if (!p) return total;
            let price = p.price || 0;
            // Handle size price
            if (item.sizeName && p.sizes) {
                const s = p.sizes.find((s: any) => (s.translations?.[0]?.name || s.name) === item.sizeName);
                if (s) price += (s.priceModifier || 0);
            }
            return total + (price * item.quantity);
        }, 0);
    };

    const basePrice = calculateBasePrice();

    useEffect(() => {
        if (autoCalculate) {
            let final = basePrice;
            if (discountValue > 0) {
                if (discountType === 'PERCENTAGE') {
                    final = basePrice * (1 - discountValue / 100);
                } else {
                    final = basePrice - discountValue;
                }
            }
            setPrice(Math.max(0, Math.round(final)));
        }
    }, [basePrice, discountType, discountValue, autoCalculate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = { name, slug, description, price, discountType, discountValue, isActive, items, image };

        const url = isEdit ? `/api/admin/combos/${initialData.id}` : '/api/admin/combos';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            router.push('/admin/products/combos');
            router.refresh();
        } else {
            const err = await res.json();
            alert('Error: ' + err.error);
        }
        setLoading(false);
    };

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
        fontWeight: '500'
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.05)',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                <h2 style={{
                    marginTop: 0,
                    marginBottom: '2rem',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    {isEdit ? 'Edit Combo Bundle' : 'Create New Combo Bundle'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Name</label>
                        <input required style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Family Feast" />
                    </div>
                    <div>
                        <label style={labelStyle}>Slug (Unique URL)</label>
                        <input required style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. family-feast" />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Description</label>
                    <textarea style={{ ...inputStyle, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe what's included..." />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Cover Image</label>
                    <ImageUpload value={image} onChange={setImage} />
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '2rem'
                }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Pricing & Settings</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Final Price (SEK)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                    required
                                    type="number"
                                    style={{ ...inputStyle, background: autoCalculate ? 'rgba(255,255,255,0.02)' : inputStyle.background }}
                                    value={price}
                                    onChange={e => setPrice(Number(e.target.value))}
                                    disabled={autoCalculate}
                                />
                                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={autoCalculate}
                                        onChange={e => setAutoCalculate(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
                                    />
                                    Auto-calculate ({basePrice} SEK)
                                </label>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Discount Type</label>
                            <select style={inputStyle} value={discountType} onChange={e => {
                                setDiscountType(e.target.value);
                                setAutoCalculate(true);
                            }}>
                                <option style={{ color: '#000' }} value="PERCENTAGE">Percentage (%)</option>
                                <option style={{ color: '#000' }} value="FIXED">Fixed Amount (SEK)</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Discount Value</label>
                            <input type="number" style={inputStyle} value={discountValue} onChange={e => {
                                setDiscountValue(Number(e.target.value));
                                setAutoCalculate(true);
                            }} />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer' }}>
                            <div style={{ position: 'relative', width: '40px', height: '20px' }}>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: isActive ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '34px',
                                    transition: '.4s'
                                }}></span>
                                <span style={{
                                    position: 'absolute', content: '""', height: '14px', width: '14px', left: isActive ? '23px' : '3px', bottom: '3px',
                                    backgroundColor: 'white', borderRadius: '50%', transition: '.4s'
                                }}></span>
                            </div>
                            <span>Active / Visible on Menu</span>
                        </label>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: '#fff', margin: 0 }}>Combo Items</h3>
                        <button type="button" onClick={() => setIsPickerOpen(true)} style={{
                            padding: '0.6rem 1.2rem',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            + Add Products
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map((it, idx) => {
                            const p = getProduct(it.productId);
                            return (
                                <div key={idx} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}>
                                    {/* Image */}
                                    <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        {p?.image ? (
                                            <img
                                                src={p.image.startsWith('http') || p.image.startsWith('/') ? p.image : `/api/uploads/${p.image}`}
                                                alt=""
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 1.5rem;');
                                                }}
                                            />
                                        ) : null}
                                        <div style={{ width: '100%', height: '100%', display: p?.image ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍕</div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', marginBottom: '6px', color: '#fff' }}>{p?.translations?.[0]?.name || 'Unknown Product'}</div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {p?.sizes?.length > 0 && (
                                                <div style={{ position: 'relative' }}>
                                                    <select
                                                        style={{
                                                            ...inputStyle,
                                                            padding: '0.4rem 2rem 0.4rem 0.8rem',
                                                            fontSize: '0.85rem',
                                                            width: 'auto',
                                                            background: 'rgba(0,0,0,0.3)',
                                                            borderColor: 'rgba(255,255,255,0.1)'
                                                        }}
                                                        value={it.sizeName}
                                                        onChange={e => updateItem(idx, 'sizeName', e.target.value)}
                                                    >
                                                        {p.sizes.map((s: any) => (
                                                            <option key={s.id} style={{ color: '#000' }} value={s.translations?.[0]?.name || s.name}>
                                                                {s.translations?.[0]?.name || s.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Qty:</span>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    style={{
                                                        ...inputStyle,
                                                        width: '70px',
                                                        padding: '0.4rem',
                                                        textAlign: 'center',
                                                        background: 'rgba(0,0,0,0.3)'
                                                    }}
                                                    value={it.quantity}
                                                    onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="button" onClick={() => removeItem(idx)} style={{
                                        color: '#f87171',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        padding: '0.5rem 0.8rem',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}>
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                        {items.length === 0 && (
                            <div style={{
                                padding: '3rem',
                                textAlign: 'center',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                                border: '1px dashed rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.4)'
                            }}>
                                No items in this combo yet. Click "Add Products" above!
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button type="button" onClick={() => router.back()} style={{
                        padding: '1rem 2rem',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                    }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} style={{
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Saving...' : (isEdit ? 'Update Combo' : 'Create Combo')}
                    </button>
                </div>
            </form>

            {isPickerOpen && (
                <ProductPicker
                    products={products}
                    onSelect={handlePickerSelect}
                    onCancel={() => setIsPickerOpen(false)}
                />
            )}
        </>
    );
}
