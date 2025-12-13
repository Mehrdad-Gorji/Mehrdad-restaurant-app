'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './image-upload';

export default function CategoryList({ initialCategories }: { initialCategories: any[] }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editImage, setEditImage] = useState('');
    const [editNameEn, setEditNameEn] = useState('');
    const [editNameSv, setEditNameSv] = useState('');
    const [editNameDe, setEditNameDe] = useState('');
    const [editNameFa, setEditNameFa] = useState('');
    const [saving, setSaving] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to delete category'}`);
                return;
            }
            router.refresh();
        } catch (e) {
            alert('Network error');
        }
    };

    const handleEdit = (cat: any) => {
        setEditingId(cat.id);
        setEditImage(cat.image || '');
        setEditNameEn(cat.translations.find((t: any) => t.language === 'en')?.name || '');
        setEditNameSv(cat.translations.find((t: any) => t.language === 'sv')?.name || '');
        setEditNameDe(cat.translations.find((t: any) => t.language === 'de')?.name || '');
        setEditNameFa(cat.translations.find((t: any) => t.language === 'fa')?.name || '');
    };

    const handleSave = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    image: editImage,
                    nameEn: editNameEn,
                    nameSv: editNameSv,
                    nameDe: editNameDe,
                    nameFa: editNameFa
                })
            });
            if (!res.ok) {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to save'}`);
            } else {
                setEditingId(null);
                router.refresh();
            }
        } catch (e) {
            console.error(e);
            alert('Error saving');
        }
        setSaving(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '0.5rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.85rem',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.25rem',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500' as const
    };

    if (initialCategories.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'rgba(255,255,255,0.4)'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                No categories found. Add your first category!
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {initialCategories.map((cat: any) => {
                const enName = cat.translations.find((t: any) => t.language === 'en')?.name;
                const isEditing = editingId === cat.id;

                return (
                    <div
                        key={cat.id}
                        style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '14px',
                            border: isEditing ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        {isEditing ? (
                            /* Edit Mode */
                            <div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                                    {/* Image & Slug Header */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '1rem',
                                        paddingBottom: '1rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ flex: '0 0 150px' }}>
                                            <ImageUpload value={editImage} onChange={setEditImage} />
                                        </div>
                                        <div style={{ flex: 1, paddingTop: '0.5rem' }}>
                                            <div style={{ fontWeight: '600', color: '#fff', marginBottom: '0.3rem', fontSize: '1.1rem' }}>{cat.slug}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Click image to select from library</div>
                                        </div>
                                    </div>

                                    {/* Translation Fields - 2x2 Grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '0.75rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '1rem',
                                        borderRadius: '10px'
                                    }}>
                                        <div>
                                            <label style={labelStyle}>🇬🇧 English</label>
                                            <input style={inputStyle} value={editNameEn} onChange={e => setEditNameEn(e.target.value)} placeholder="English name" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>🇸🇪 Svenska</label>
                                            <input style={inputStyle} value={editNameSv} onChange={e => setEditNameSv(e.target.value)} placeholder="Swedish name" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>🇩🇪 Deutsch</label>
                                            <input style={inputStyle} value={editNameDe} onChange={e => setEditNameDe(e.target.value)} placeholder="German name" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>🇮🇷 فارسی</label>
                                            <input style={{ ...inputStyle, direction: 'rtl' }} value={editNameFa} onChange={e => setEditNameFa(e.target.value)} placeholder="نام فارسی" />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => handleSave(cat.id)}
                                        disabled={saving}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: saving ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {saving ? '...' : '✓ Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'rgba(255,255,255,0.6)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '12px',
                                        background: cat.image
                                            ? `url(${cat.image}) center/cover`
                                            : 'rgba(139, 92, 246, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {!cat.image && <span style={{ fontSize: '1.25rem' }}>🍕</span>}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: '#fff' }}>
                                        {enName || cat.slug}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.4)',
                                        marginTop: '0.15rem'
                                    }}>
                                        {cat.slug}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: 'rgba(99, 102, 241, 0.15)',
                                            color: '#a5b4fc',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#f87171',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

