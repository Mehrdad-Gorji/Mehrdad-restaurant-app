'use client';

import { useState, useMemo } from 'react';

interface ProductPickerProps {
    products: any[];
    onSelect: (selectedProducts: any[]) => void;
    onCancel: () => void;
}

export default function ProductPicker({ products, onSelect, onCancel }: ProductPickerProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lower = searchTerm.toLowerCase();
        return products.filter(p =>
            (p.translations?.[0]?.name || p.slug).toLowerCase().includes(lower) ||
            p.slug.toLowerCase().includes(lower)
        );
    }, [products, searchTerm]);

    const toggleProduct = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleSelect = () => {
        const selected = products.filter(p => selectedIds.has(p.id));
        onSelect(selected);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div style={{
                width: '100%', maxWidth: '800px',
                background: '#1f2937',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column',
                height: '80vh', maxHeight: '800px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Select Products</h3>
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>&times;</button>
                </div>

                {/* Search */}
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                    <input
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            outline: 'none',
                        }}
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {filteredProducts.map(p => {
                            const isSelected = selectedIds.has(p.id);
                            const name = p.translations?.[0]?.name || p.slug;
                            const price = p.price;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => toggleProduct(p.id)}
                                    style={{
                                        border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <div style={{
                                            width: '20px', height: '20px',
                                            borderRadius: '6px',
                                            border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                            background: isSelected ? '#6366f1' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '0.8rem'
                                        }}>
                                            {isSelected && '✓'}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', paddingRight: '20px', color: '#fff' }}>{name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{Number(price)} SEK</div>
                                    {p.sizes?.length > 0 && (
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                                            {p.sizes.length} sizes available
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>No products found.</div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {selectedIds.size} selected
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={onCancel} style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            color: 'rgba(255,255,255,0.8)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}>Cancel</button>
                        <button onClick={handleSelect} disabled={selectedIds.size === 0} style={{
                            padding: '0.75rem 1.5rem',
                            background: selectedIds.size === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: selectedIds.size === 0 ? 'rgba(255,255,255,0.2)' : 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '600'
                        }}>
                            Add Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
