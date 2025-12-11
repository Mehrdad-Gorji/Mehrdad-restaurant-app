'use client';

import { useState } from 'react';

export default function SizeTemplates({ initialSizes }: { initialSizes: string[] }) {
    const [sizes, setSizes] = useState<string[]>(initialSizes || ['Small', 'Medium', 'Large']);
    const [newSize, setNewSize] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const addSize = () => {
        if (newSize.trim() && !sizes.includes(newSize.trim())) {
            setSizes([...sizes, newSize.trim()]);
            setNewSize('');
        }
    };

    const removeSize = (index: number) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditingValue(sizes[index]);
    };

    const saveEdit = () => {
        if (editingIndex !== null && editingValue.trim() && !sizes.includes(editingValue.trim())) {
            const newSizes = [...sizes];
            newSizes[editingIndex] = editingValue.trim();
            setSizes(newSizes);
            setEditingIndex(null);
            setEditingValue('');
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditingValue('');
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newSizes = [...sizes];
        [newSizes[index - 1], newSizes[index]] = [newSizes[index], newSizes[index - 1]];
        setSizes(newSizes);
    };

    const moveDown = (index: number) => {
        if (index === sizes.length - 1) return;
        const newSizes = [...sizes];
        [newSizes[index], newSizes[index + 1]] = [newSizes[index + 1], newSizes[index]];
        setSizes(newSizes);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ predefinedSizes: JSON.stringify(sizes) })
            });
            if (res.ok) {
                alert('Size templates saved successfully!');
            } else {
                alert('Failed to save size templates.');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving size templates.');
        } finally {
            setSaving(false);
        }
    };

    const sectionStyle = {
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '1.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s'
    };

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        Size Templates
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '1rem' }}>
                        Define common sizes to reuse across all products
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        boxShadow: saving ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    {saving ? 'Saving...' : '💾 Save Templates'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                {/* Add New Size Card */}
                <div style={sectionStyle}>
                    <h3 style={{
                        marginTop: 0,
                        marginBottom: '1.5rem',
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
                        }}>➕</span>
                        Add New Size
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSize()}
                            placeholder="e.g., Family Size, Personal"
                            style={{
                                ...inputStyle,
                                flex: 1
                            }}
                        />
                        <button
                            onClick={addSize}
                            style={{
                                padding: '0.875rem 1.5rem',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Size List Card */}
                <div style={sectionStyle}>
                    <h3 style={{
                        marginTop: 0,
                        marginBottom: '1.5rem',
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
                        }}>📏</span>
                        Current Sizes ({sizes.length})
                    </h3>
                    {sizes.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'rgba(255,255,255,0.4)',
                            fontStyle: 'italic',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px'
                        }}>
                            No sizes defined. Add your first size above.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {sizes.map((size, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    transition: 'all 0.2s'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem'
                                    }}>
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0 || editingIndex !== null}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                background: (index === 0 || editingIndex !== null) ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'rgba(255,255,255,0.7)',
                                                cursor: (index === 0 || editingIndex !== null) ? 'not-allowed' : 'pointer',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === sizes.length - 1 || editingIndex !== null}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                background: (index === sizes.length - 1 || editingIndex !== null) ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'rgba(255,255,255,0.7)',
                                                cursor: (index === sizes.length - 1 || editingIndex !== null) ? 'not-allowed' : 'pointer',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            ▼
                                        </button>
                                    </div>

                                    {editingIndex === index ? (
                                        <input
                                            type="text"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                            autoFocus
                                            style={{
                                                ...inputStyle,
                                                borderColor: '#6366f1',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                flex: 1
                                            }}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => startEdit(index)}
                                            style={{
                                                flex: 1,
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                borderRadius: '8px',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {size}
                                        </div>
                                    )}

                                    {editingIndex === index ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={saveEdit}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    color: '#34d399',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                ✓ Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    color: 'rgba(255,255,255,0.7)',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                ✕ Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => removeSize(index)}
                                            disabled={editingIndex !== null}
                                            style={{
                                                padding: '0.5rem 0.8rem',
                                                background: editingIndex !== null ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.15)',
                                                color: editingIndex !== null ? 'rgba(255,255,255,0.3)' : '#f87171',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: editingIndex !== null ? 'not-allowed' : 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
