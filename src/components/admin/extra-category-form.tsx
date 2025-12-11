'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    initialData?: any;
    onCancel?: () => void;
}

export default function ExtraCategoryForm({ initialData, onCancel }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Translations
    const [nameEn, setNameEn] = useState('');
    const [nameSv, setNameSv] = useState('');
    const [nameDe, setNameDe] = useState('');
    const [nameFa, setNameFa] = useState('');

    useEffect(() => {
        if (initialData) {
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
            const url = '/api/admin/extra-categories';
            const method = initialData ? 'PUT' : 'POST';
            const body = {
                id: initialData?.id,
                nameEn, nameSv, nameDe, nameFa
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                if (onCancel) onCancel();
                if (!initialData) {
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
        } catch (e) {
            console.error(e);
            alert('Failed to save category');
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
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.05)',
            height: 'fit-content'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                    }}>
                        {initialData ? '✏️' : '➕'}
                    </span>
                    {initialData ? 'Edit Category' : 'Add New Category'}
                </h3>
                {initialData && (
                    <button
                        onClick={onCancel}
                        style={{
                            fontSize: '0.85rem',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.7)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                    <label style={labelStyle}>Name (English)</label>
                    <input required style={inputStyle} value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g., Toppings" />
                </div>
                <div>
                    <label style={labelStyle}>Name (Swedish)</label>
                    <input style={inputStyle} value={nameSv} onChange={e => setNameSv(e.target.value)} placeholder="e.g., Pålägg" />
                </div>
                <div>
                    <label style={labelStyle}>Name (German)</label>
                    <input style={inputStyle} value={nameDe} onChange={e => setNameDe(e.target.value)} placeholder="e.g., Beläge" />
                </div>
                <div>
                    <label style={labelStyle}>Name (Persian)</label>
                    <input style={inputStyle} value={nameFa} onChange={e => setNameFa(e.target.value)} placeholder="e.g., مواد اضافی" />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: initialData
                            ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                            : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        marginTop: '0.5rem',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    {loading ? 'Processing...' : (initialData ? 'Update Category' : 'Add Category')}
                </button>
            </form>
        </div>
    );
}
