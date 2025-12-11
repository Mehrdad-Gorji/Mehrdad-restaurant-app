'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ComboList({ combos: initialCombos }: { combos: any[] }) {
    const [combos, setCombos] = useState(initialCombos);
    const [deleting, setDeleting] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/combos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCombos(combos.filter(c => c.id !== id));
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to delete'}`);
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.05)'
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
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    padding: '0.4rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                }}>
                    📦
                </span>
                Active Combos
            </h3>

            {combos.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'rgba(255,255,255,0.4)',
                    fontStyle: 'italic',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    No combos found. Create your first bundle above!
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {combos.map((c: any) => (
                        <div key={c.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}>
                                    {c.image ? (
                                        <img src={c.image.startsWith('http') || c.image.startsWith('/') ? c.image : `/api/uploads/${c.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                    ) : '🥡'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#fff' }}>{c.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
                                        {c.items?.length ?? 0} items • {c.slug}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    color: '#4ade80',
                                    background: 'rgba(74, 222, 128, 0.1)',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '8px'
                                }}>
                                    {Math.round(c.price)} SEK
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link
                                        href={`/admin/products/combos/${c.id}`}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(59, 130, 246, 0.15)',
                                            color: '#60a5fa',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(c.id, c.name)}
                                        disabled={deleting === c.id}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#f87171',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: deleting === c.id ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            opacity: deleting === c.id ? 0.7 : 1
                                        }}
                                    >
                                        {deleting === c.id ? '...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
