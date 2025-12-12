'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './image-upload';

export default function CategoryList({ initialCategories }: { initialCategories: any[] }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editImage, setEditImage] = useState('');
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
    };

    const handleSave = async (id: string) => {
        setSaving(true);
        try {
            await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, image: editImage })
            });
            setEditingId(null);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert('Error saving');
        }
        setSaving(false);
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        {/* Image */}
                        <div style={{ flexShrink: 0 }}>
                            {isEditing ? (
                                <div style={{ width: '100px' }}>
                                    <ImageUpload
                                        value={editImage}
                                        onChange={setEditImage}
                                    />
                                </div>
                            ) : (
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
                            )}
                        </div>

                        {/* Info */}
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

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {isEditing ? (
                                <>
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
                                        {saving ? '...' : 'Save'}
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
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
