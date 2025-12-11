'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ProductListManagerProps {
    initialProducts: any[];
    categories: any[];
}

export default function ProductListManager({ initialProducts, categories }: ProductListManagerProps) {
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        } finally {
            setIsDeleting(null);
        }
    };

    const filteredProducts = products.filter(product => {
        const name = product.translations.find((t: any) => t.language === 'en')?.name ||
            product.translations[0]?.name || product.slug;

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.slug.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;

        return matchesSearch && matchesCategory;
    });

    const inputStyle = {
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s',
    };

    return (
        <div>
            {/* Filters */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                padding: '1rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Search */}
                <div>
                    <input
                        type="text"
                        placeholder="🔍 Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ ...inputStyle, width: '100%' }}
                    />
                </div>

                {/* Category Filter */}
                <div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                    >
                        <option value="" style={{ background: '#1f2937' }}>All Categories</option>
                        {categories.map(cat => {
                            const catName = cat.translations.find((t: any) => t.language === 'en')?.name || cat.slug;
                            return (
                                <option key={cat.id} value={cat.id} style={{ background: '#1f2937' }}>
                                    {catName}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{filteredProducts.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                        {searchTerm || selectedCategory ? 'Filtered Products' : 'Total Products'}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                overflow: 'hidden'
            }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 180px', // Wider Actions column
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    <div>Product</div>
                    <div>Slug</div>
                    <div>Price</div>
                    <div>Category</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {/* Table Body */}
                {filteredProducts.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.4)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍕</div>
                        No products found matching your filters.
                    </div>
                ) : (
                    filteredProducts.map((product: any, idx: number) => {
                        const name = product.translations.find((t: any) => t.language === 'en')?.name ||
                            product.translations[0]?.name || product.slug;
                        const categoryName = product.category?.translations?.find((t: any) => t.language === 'en')?.name ||
                            product.category?.translations?.[0]?.name || product.category?.slug || 'Uncategorized';

                        const isRowDeleting = isDeleting === product.id;

                        return (
                            <div
                                key={product.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr 180px',
                                    gap: '1rem',
                                    padding: '1rem 1.5rem',
                                    alignItems: 'center',
                                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'background 0.2s ease',
                                    opacity: isRowDeleting ? 0.5 : 1,
                                    pointerEvents: isRowDeleting ? 'none' : 'auto'
                                }}
                            >
                                <div style={{ fontWeight: '600' }}>{name}</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{product.slug}</div>
                                <div style={{
                                    fontWeight: '700',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {Number(product.price)} SEK
                                </div>
                                <div>
                                    <span style={{
                                        padding: '0.3rem 0.75rem',
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        color: '#a5b4fc',
                                        borderRadius: '50px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        {categoryName}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        style={{
                                            padding: '0.4rem 0.75rem',
                                            background: 'rgba(99, 102, 241, 0.15)',
                                            color: '#a5b4fc',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id, name)}
                                        disabled={!!isDeleting}
                                        style={{
                                            padding: '0.4rem 0.75rem',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#fca5a5',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isRowDeleting ? '...' : 'Delete'}
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
