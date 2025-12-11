'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/image-upload';

interface Props {
    initialData?: any;
    categories?: any[];
    onCancel?: () => void;
}

export default function ExtraForm({ initialData, categories = [], onCancel }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [price, setPrice] = useState('0');
    const [image, setImage] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [nameSv, setNameSv] = useState('');
    const [nameDe, setNameDe] = useState('');
    const [nameFa, setNameFa] = useState('');

    useEffect(() => {
        if (initialData) {
            setPrice(initialData.price.toString());
            setImage(initialData.image || '');
            setCategoryId(initialData.categoryId || '');
            const getTrans = (lang: string) => initialData.translations.find((t: any) => t.language === lang)?.name || '';
            setNameEn(getTrans('en'));
            setNameSv(getTrans('sv'));
            setNameDe(getTrans('de'));
            setNameFa(getTrans('fa'));
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = '/api/extras';
            const method = initialData ? 'PUT' : 'POST';
            const body = {
                id: initialData?.id,
                price, image, categoryId, nameEn, nameSv, nameDe, nameFa
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                if (onCancel) onCancel();
                if (!initialData) {
                    setPrice('0');
                    setImage('');
                    setCategoryId('');
                    setNameEn('');
                    setNameSv('');
                    setNameDe('');
                    setNameFa('');
                }
                router.refresh();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error || 'Unknown error'}`);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500' as const
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '1.5rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#fff'
                }}>
                    {initialData ? '✏️ Edit Extra' : '➕ Add New Extra'}
                </h3>
                {initialData && (
                    <button
                        onClick={onCancel}
                        style={{
                            fontSize: '0.85rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '0.4rem 0.75rem',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.6)'
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Price (SEK)</label>
                    <input
                        required
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Image</label>
                    <ImageUpload value={image} onChange={setImage} />
                </div>
                <div>
                    <label style={labelStyle}>Category (Optional)</label>
                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        style={{
                            ...inputStyle,
                            cursor: 'pointer'
                        }}
                    >
                        <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>No Category</option>
                        {categories.map(cat => {
                            const name = cat.translations.find((t: any) => t.language === 'en')?.name || 'Unnamed';
                            return <option key={cat.id} value={cat.id} style={{ background: '#1a1a2e', color: '#fff' }}>{name}</option>;
                        })}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Name (English) *</label>
                    <input
                        required
                        value={nameEn}
                        onChange={e => setNameEn(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Name (Swedish)</label>
                    <input
                        value={nameSv}
                        onChange={e => setNameSv(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Name (German)</label>
                    <input
                        value={nameDe}
                        onChange={e => setNameDe(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Name (Persian)</label>
                    <input
                        value={nameFa}
                        onChange={e => setNameFa(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0.85rem 1.5rem',
                        background: initialData
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loading ? 'Processing...' : (initialData ? '✓ Update Extra' : '+ Add Extra')}
                </button>
            </form>
        </div>
    );
}
