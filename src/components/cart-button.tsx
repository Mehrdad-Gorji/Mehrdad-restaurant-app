'use client';

import Link from 'next/link';
import { useCart } from '@/context/cart-context';

interface Props {
    lang: string;
    label: string;
}

export default function CartButton({ lang, label }: Props) {
    const { items } = useCart();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const hasItems = itemCount > 0;

    return (
        <Link href={`/${lang}/cart`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: hasItems ? '0.6rem 1.25rem' : '0.6rem 1rem',
            background: hasItems
                ? 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'
                : 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: hasItems ? '#fff' : 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            boxShadow: hasItems ? '0 4px 20px rgba(255, 152, 0, 0.4)' : 'none',
            border: hasItems ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
            transition: 'all 0.3s ease',
            position: 'relative'
        }}>
            {/* Cart Icon */}
            <span style={{ fontSize: '1.1rem' }}>🛒</span>

            {/* Label */}
            <span>{label}</span>

            {/* Item Count Badge */}
            {hasItems && (
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '22px',
                    height: '22px',
                    padding: '0 6px',
                    background: '#fff',
                    color: '#ff5722',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    marginLeft: '0.25rem'
                }}>
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
