'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    deliveryMethod: string;
    items: any[];
}

interface OrderHistoryClientProps {
    lang: string;
}

export default function OrderHistoryClient({ lang }: OrderHistoryClientProps) {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const labels = {
        en: {
            title: 'My Orders',
            subtitle: 'Enter your email to view your order history',
            email: 'Email Address',
            search: 'Find Orders',
            searching: 'Searching...',
            noOrders: 'No orders found with this email',
            orderNumber: 'Order #',
            date: 'Date',
            status: 'Status',
            total: 'Total',
            items: 'Items',
            details: 'View Details',
            reorder: 'Re-order',
            back: 'Back to Orders',
            pending: 'Pending',
            confirmed: 'Confirmed',
            preparing: 'Preparing',
            ready: 'Ready',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
            delivery: 'Delivery',
            pickup: 'Pickup'
        },
        sv: {
            title: 'Mina Beställningar',
            subtitle: 'Ange din e-post för att se din orderhistorik',
            email: 'E-postadress',
            search: 'Hitta beställningar',
            searching: 'Söker...',
            noOrders: 'Inga beställningar hittades med denna e-post',
            orderNumber: 'Order #',
            date: 'Datum',
            status: 'Status',
            total: 'Totalt',
            items: 'Varor',
            details: 'Visa detaljer',
            reorder: 'Beställ igen',
            back: 'Tillbaka',
            pending: 'Väntande',
            confirmed: 'Bekräftad',
            preparing: 'Förbereder',
            ready: 'Klar',
            delivered: 'Levererad',
            cancelled: 'Avbruten',
            delivery: 'Leverans',
            pickup: 'Avhämtning'
        },
        de: {
            title: 'Meine Bestellungen',
            subtitle: 'Geben Sie Ihre E-Mail ein, um Ihre Bestellhistorie anzuzeigen',
            email: 'E-Mail-Adresse',
            search: 'Bestellungen suchen',
            searching: 'Suche...',
            noOrders: 'Keine Bestellungen mit dieser E-Mail gefunden',
            orderNumber: 'Bestellung #',
            date: 'Datum',
            status: 'Status',
            total: 'Gesamt',
            items: 'Artikel',
            details: 'Details anzeigen',
            reorder: 'Erneut bestellen',
            back: 'Zurück',
            pending: 'Ausstehend',
            confirmed: 'Bestätigt',
            preparing: 'In Vorbereitung',
            ready: 'Bereit',
            delivered: 'Geliefert',
            cancelled: 'Storniert',
            delivery: 'Lieferung',
            pickup: 'Abholung'
        },
        fa: {
            title: 'سفارشات من',
            subtitle: 'برای مشاهده تاریخچه سفارشات، ایمیل خود را وارد کنید',
            email: 'آدرس ایمیل',
            search: 'جستجوی سفارشات',
            searching: 'در حال جستجو...',
            noOrders: 'سفارشی با این ایمیل پیدا نشد',
            orderNumber: 'سفارش #',
            date: 'تاریخ',
            status: 'وضعیت',
            total: 'مجموع',
            items: 'آیتم‌ها',
            details: 'مشاهده جزئیات',
            reorder: 'سفارش مجدد',
            back: 'بازگشت',
            pending: 'در انتظار',
            confirmed: 'تایید شده',
            preparing: 'در حال آماده‌سازی',
            ready: 'آماده',
            delivered: 'تحویل داده شده',
            cancelled: 'لغو شده',
            delivery: 'تحویل',
            pickup: 'حضوری'
        }
    };

    const t = labels[lang as keyof typeof labels] || labels.en;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setSearched(true);

        try {
            const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (orderId: string) => {
        try {
            const res = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();

            if (data.success && data.cartItems) {
                // Get existing cart
                const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

                // Add items to cart
                const newCart = [...existingCart, ...data.cartItems];
                localStorage.setItem('cart', JSON.stringify(newCart));

                // Trigger cart update event
                window.dispatchEvent(new Event('cartUpdated'));

                alert(lang === 'fa' ? 'آیتم‌ها به سبد خرید اضافه شدند!' : 'Items added to cart!');
            }
        } catch (error) {
            console.error('Error reordering:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING': return '#f59e0b';
            case 'CONFIRMED': return '#3b82f6';
            case 'PREPARING': return '#8b5cf6';
            case 'READY': return '#10b981';
            case 'DELIVERED': return '#22c55e';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status: string) => {
        const key = status.toLowerCase() as keyof typeof t;
        return t[key] || status;
    };

    if (selectedOrder) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
                <button
                    onClick={() => setSelectedOrder(null)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff9800',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    ← {t.back}
                </button>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>
                            {t.orderNumber}{selectedOrder.orderNumber}
                        </h2>
                        <span style={{
                            background: getStatusColor(selectedOrder.status),
                            color: '#fff',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            {getStatusLabel(selectedOrder.status)}
                        </span>
                    </div>

                    <div style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.6)' }}>
                        <div>{t.date}: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                        <div>{selectedOrder.deliveryMethod === 'delivery' ? '🚚 ' + t.delivery : '🏪 ' + t.pickup}</div>
                    </div>

                    <h3 style={{ color: '#fff', marginBottom: '1rem' }}>{t.items}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {selectedOrder.items.map((item: any, idx: number) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <span style={{ color: '#fff' }}>{item.quantity}x {item.productName}</span>
                                    {item.size && <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '0.5rem' }}>({item.size})</span>}
                                </div>
                                <span style={{ color: '#ff9800' }}>{item.price} SEK</span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700' }}>
                            {t.total}: {selectedOrder.totalAmount} SEK
                        </span>
                        <button
                            onClick={() => handleReorder(selectedOrder.id)}
                            style={{
                                background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.75rem 1.5rem',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            🔄 {t.reorder}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                }}>
                    📦 {t.title}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>{t.subtitle}</p>
            </div>

            {/* Email Search Form */}
            <form onSubmit={handleSearch} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255,255,255,0.7)'
                }}>
                    {t.email}
                </label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        style={{
                            flex: 1,
                            minWidth: '200px',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50px',
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.75rem 2rem',
                            background: loading ? '#666' : 'linear-gradient(135deg, #ff9800, #ff5722)',
                            border: 'none',
                            borderRadius: '50px',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? t.searching : t.search}
                    </button>
                </div>
            </form>

            {/* Orders List */}
            {searched && (
                orders.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        color: 'rgba(255,255,255,0.5)'
                    }}>
                        📭 {t.noOrders}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '1.1rem' }}>
                                            {t.orderNumber}{order.orderNumber}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} {t.items.toLowerCase()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            background: getStatusColor(order.status),
                                            color: '#fff',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '50px',
                                            fontWeight: '600',
                                            fontSize: '0.8rem',
                                            display: 'inline-block',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                        <div style={{ color: '#ff9800', fontWeight: '700' }}>
                                            {order.totalAmount} SEK
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
