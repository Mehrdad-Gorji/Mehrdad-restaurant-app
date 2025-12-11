'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProductDetailModal from '@/components/product-detail-modal';

interface ProductCardProps {
    product: {
        id: string;
        slug: string;
        name: string;
        description?: string;
        price: number;
        image?: string | null;
        sizes?: any[];
        extras?: any[];
    };
    lang: string;
}

export default function HomepageProductCard({ product, lang }: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    return (
        <>
            <div
                onClick={handleClick}
                style={{
                    padding: '0',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer'
                }}
                className="product-card"
            >
                {/* Product Image */}
                <div style={{
                    height: '180px',
                    background: product.image
                        ? `url(${product.image.startsWith('/') ? product.image : `/uploads/${product.image}`}) center/cover`
                        : 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                    position: 'relative'
                }}>
                    {/* Price Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                        borderRadius: '50px',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
                    }}>
                        {product.price} kr
                    </div>
                    {/* Overlay Gradient */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                    }} />
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        marginBottom: '0.5rem',
                        color: '#fff',
                        fontWeight: '700'
                    }}>
                        {product.name}
                    </h3>
                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {product.description || ''}
                    </p>
                </div>
            </div>

            {/* Modal */}
            <ProductDetailModal
                product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    description: product.description || '',
                    price: product.price,
                    image: product.image || null,
                    sizes: product.sizes || [],
                    extras: product.extras || []
                }}
                lang={lang}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
