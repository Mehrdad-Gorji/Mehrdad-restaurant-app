'use client';

import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ComboSmartImage from "@/components/combo-smart-image";

interface Props {
    combo: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        price: number;
        discountType?: string | null;
        discountValue?: number | null;
        image?: string | null;
        items: {
            quantity: number;
            productName: string;
            image?: string | null;
        }[];
    };
    lang: string;
}

export default function ComboDetailClient({ combo, lang }: Props) {
    const { addToCart } = useCart();
    const router = useRouter();

    const handleAddToCart = () => {
        // compute final price applying discount if present
        let finalPrice = combo.price;
        if (combo.discountType && combo.discountValue) {
            if (combo.discountType === 'PERCENTAGE') {
                finalPrice = combo.price * (1 - (combo.discountValue / 100));
            } else {
                finalPrice = combo.price - combo.discountValue;
            }
            finalPrice = Math.max(0, finalPrice);
        }

        addToCart({
            productId: combo.id,
            name: combo.name,
            price: Math.round(finalPrice),
            quantity: 1,
            image: combo.image || undefined,
            isCombo: true
        });
        // Optional: Show success feedback or redirect to cart
        router.push(`/${lang}/cart`);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <button
                onClick={() => router.back()}
                style={{
                    marginBottom: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: 'var(--text-muted)'
                }}
            >
                ← {lang === 'fa' ? 'بازگشت' : 'Back'}
            </button>

            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                {/* Image Section */}
                {/* Image Section */}
                <div style={{
                    backgroundColor: '#fff0e6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
                        <ComboSmartImage image={combo.image} items={combo.items} />
                    </div>
                </div>

                {/* Details Section */}
                <div>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderRadius: '50px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                    }}>
                        DEAL
                    </div>

                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{combo.name}</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        {combo.description || 'Special bundle offer!'}
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                            {lang === 'fa' ? 'محتویات پکیج' : 'Package Includes'}:
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {combo.items.map((item, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        overflow: 'hidden'
                                    }}>
                                        {item.image ? (
                                            <img
                                                src={item.image.startsWith('http') ? item.image : `/api/uploads/${item.image}`}
                                                alt={item.productName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span>📦</span>
                                        )}
                                    </div>
                                    <span style={{ fontWeight: '500' }}>
                                        {item.quantity}x {item.productName}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: 'auto' }}>
                        <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
                            {(() => {
                                let finalPrice = combo.price;
                                if (combo.discountType && combo.discountValue) {
                                    if (combo.discountType === 'PERCENTAGE') {
                                        finalPrice = combo.price * (1 - (combo.discountValue / 100));
                                    } else {
                                        finalPrice = combo.price - combo.discountValue;
                                    }
                                    finalPrice = Math.max(0, finalPrice);
                                }
                                return Math.round(finalPrice);
                            })()} SEK
                        </span>

                        <button
                            onClick={handleAddToCart}
                            className="btn btn-primary"
                            style={{
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                borderRadius: '50px',
                                flex: 1
                            }}
                        >
                            {lang === 'fa' ? 'افزودن به سبد خرید' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
