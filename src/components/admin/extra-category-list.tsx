'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExtraCategoryForm from './extra-category-form';

interface Props {
    categories: any[];
}

export default function ExtraCategoryList({ categories }: Props) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await fetch(`/api/admin/extra-categories/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete category');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting category');
        }
    };

    const editingCategory = editingId ? categories.find(c => c.id === editingId) : null;

    if (editingCategory) {
        return (
            <ExtraCategoryForm
                initialData={editingCategory}
                onCancel={() => setEditingId(null)}
            />
        );
    }

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.05)',
            height: 'fit-content'
        }}>
            <h3 style={{
                margin: '0 0 1.5rem 0',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    padding: '0.4rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                }}>
                    📋
                </span>
                Existing Categories
            </h3>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {categories.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'rgba(255,255,255,0.4)',
                        fontStyle: 'italic',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '12px'
                    }}>
                        No categories found. Add one on the left.
                    </div>
                ) : (
                    categories.map(cat => {
                        const nameEn = cat.translations.find((t: any) => t.language === 'en')?.name || 'Unnamed';
                        return (
                            <div key={cat.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1rem', color: '#fff' }}>{nameEn}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {cat.translations.map((t: any) => (
                                            <span key={t.language} style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '0.1rem 0.4rem',
                                                borderRadius: '4px'
                                            }}>
                                                {t.language.toUpperCase()}: {t.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setEditingId(cat.id)}
                                        style={{
                                            padding: '0.5rem 0.8rem',
                                            background: 'rgba(59, 130, 246, 0.15)',
                                            color: '#60a5fa',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        style={{
                                            padding: '0.5rem 0.8rem',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#f87171',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
