import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/print-button';

export default async function SuccessPage({
    searchParams,
    params
}: {
    searchParams: Promise<{ orderId: string }>;
    params: Promise<{ lang: string }>;
}) {
    const { orderId } = await searchParams;
    const { lang } = await params;

    if (!orderId) {
        notFound();
    }

    // Fetch order with all details
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: {
                        include: { translations: true }
                    },
                    combo: {
                        include: { translations: true }
                    },
                    extras: true
                }
            },
            payments: true
        }
    });

    if (!order) {
        notFound();
    }

    // Fetch site settings for currency and company info
    const settings = await prisma.siteSettings.findFirst();
    const currencySymbol = settings?.currencySymbol || 'kr';
    const vatNumber = settings?.vatNumber || '';

    // Parse address
    let addressInfo: any = {};
    try {
        addressInfo = order.addressJson ? JSON.parse(order.addressJson as string) : {};
    } catch { }

    // Get translations
    const t = {
        en: {
            title: 'Order Confirmed!',
            subtitle: 'Thank you for your order',
            orderId: 'Order ID',
            date: 'Order Date',
            status: 'Status',
            invoice: 'Invoice',
            items: 'Order Items',
            subtotal: 'Subtotal',
            deliveryFee: 'Delivery Fee',
            tip: 'Driver Tip',
            discount: 'Discount',
            total: 'Total',
            paymentMethod: 'Payment Method',
            deliveryMethod: 'Delivery Method',
            deliveryAddress: 'Delivery Address',
            customerInfo: 'Customer Information',
            trackOrder: 'Track Your Order',
            trackText: 'You can track your order status using the order ID above.',
            returnHome: 'Return Home',
            viewMenu: 'View Menu',
            print: 'Print Invoice',
            PENDING: 'Pending',
            PAID: 'Paid',
            PREPARING: 'Preparing',
            READY: 'Ready',
            DELIVERED: 'Delivered',
            DELIVERY: 'Delivery',
            PICKUP: 'Pickup',
            DINE_IN: 'Dine In',
            vatNumber: 'VAT Number'
        },
        sv: {
            title: 'Beställning bekräftad!',
            subtitle: 'Tack för din beställning',
            orderId: 'Order-ID',
            date: 'Beställningsdatum',
            status: 'Status',
            invoice: 'Faktura',
            items: 'Beställda artiklar',
            subtotal: 'Delsumma',
            deliveryFee: 'Leveransavgift',
            tip: 'Dricks',
            discount: 'Rabatt',
            total: 'Totalt',
            paymentMethod: 'Betalningsmetod',
            deliveryMethod: 'Leveransmetod',
            deliveryAddress: 'Leveransadress',
            customerInfo: 'Kundinformation',
            trackOrder: 'Spåra din beställning',
            trackText: 'Du kan spåra din beställningsstatus med order-ID ovan.',
            returnHome: 'Tillbaka hem',
            viewMenu: 'Se menyn',
            print: 'Skriv ut faktura',
            PENDING: 'Väntar',
            PAID: 'Betald',
            PREPARING: 'Förbereds',
            READY: 'Klar',
            DELIVERED: 'Levererad',
            DELIVERY: 'Leverans',
            PICKUP: 'Hämta',
            DINE_IN: 'Äta på plats',
            vatNumber: 'Momsnummer'
        },
        fa: {
            title: 'سفارش تأیید شد!',
            subtitle: 'از سفارش شما متشکریم',
            orderId: 'شماره سفارش',
            date: 'تاریخ سفارش',
            status: 'وضعیت',
            invoice: 'فاکتور',
            items: 'اقلام سفارش',
            subtotal: 'جمع جزء',
            deliveryFee: 'هزینه ارسال',
            tip: 'انعام راننده',
            discount: 'تخفیف',
            total: 'جمع کل',
            paymentMethod: 'روش پرداخت',
            deliveryMethod: 'روش تحویل',
            deliveryAddress: 'آدرس تحویل',
            customerInfo: 'اطلاعات مشتری',
            trackOrder: 'پیگیری سفارش',
            trackText: 'می‌توانید وضعیت سفارش خود را با شماره سفارش بالا پیگیری کنید.',
            returnHome: 'بازگشت به صفحه اصلی',
            viewMenu: 'مشاهده منو',
            print: 'چاپ فاکتور',
            PENDING: 'در انتظار',
            PAID: 'پرداخت شده',
            PREPARING: 'در حال آماده‌سازی',
            READY: 'آماده',
            DELIVERED: 'تحویل داده شده',
            DELIVERY: 'ارسال',
            PICKUP: 'تحویل حضوری',
            DINE_IN: 'صرف در محل',
            vatNumber: 'شماره مالیاتی'
        },
        de: {
            title: 'Bestellung bestätigt!',
            subtitle: 'Vielen Dank für Ihre Bestellung',
            orderId: 'Bestell-ID',
            date: 'Bestelldatum',
            status: 'Status',
            invoice: 'Rechnung',
            items: 'Bestellte Artikel',
            subtotal: 'Zwischensumme',
            deliveryFee: 'Liefergebühr',
            tip: 'Trinkgeld',
            discount: 'Rabatt',
            total: 'Gesamt',
            paymentMethod: 'Zahlungsmethode',
            deliveryMethod: 'Liefermethode',
            deliveryAddress: 'Lieferadresse',
            customerInfo: 'Kundeninformation',
            trackOrder: 'Bestellung verfolgen',
            trackText: 'Sie können Ihren Bestellstatus mit der obigen Bestell-ID verfolgen.',
            returnHome: 'Zurück zur Startseite',
            viewMenu: 'Menü anzeigen',
            print: 'Rechnung drucken',
            PENDING: 'Ausstehend',
            PAID: 'Bezahlt',
            PREPARING: 'In Vorbereitung',
            READY: 'Bereit',
            DELIVERED: 'Geliefert',
            DELIVERY: 'Lieferung',
            PICKUP: 'Abholung',
            DINE_IN: 'Vor Ort essen',
            vatNumber: 'USt-IdNr.'
        }
    };

    const texts = t[lang as keyof typeof t] || t.en;

    // Get item name with translation
    const getItemName = (item: any) => {
        if (item.combo) {
            const translation = item.combo.translations?.find((t: any) => t.language === lang);
            return translation?.name || item.combo.name || 'Combo';
        }
        if (item.product) {
            const translation = item.product.translations?.find((t: any) => t.language === lang);
            return translation?.name || item.product.name || 'Product';
        }
        return 'Item';
    };

    // Calculate subtotal (items only)
    const itemsTotal = order.items.reduce((sum: number, item: any) => {
        const itemPrice = Number(item.price) * item.quantity;
        const extrasPrice = item.extras.reduce((s: number, e: any) => s + Number(e.price), 0) * item.quantity;
        return sum + itemPrice + extrasPrice;
    }, 0);

    const deliveryFee = Number(order.deliveryFee) || 0;
    const tip = Number(order.tip) || 0;
    const total = Number(order.total);

    // Status colors and icons
    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { color: string; icon: string }> = {
            PENDING: { color: '#f59e0b', icon: '⏳' },
            PAID: { color: '#3b82f6', icon: '💳' },
            PREPARING: { color: '#8b5cf6', icon: '👨‍🍳' },
            READY: { color: '#10b981', icon: '✅' },
            DELIVERED: { color: '#22c55e', icon: '🎉' }
        };
        return statusMap[status] || { color: '#666', icon: '📦' };
    };

    const statusInfo = getStatusInfo(order.status);

    return (
        <div style={{
            background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
            minHeight: '100vh',
            padding: '2rem 1rem',
            color: '#fff'
        }}>
            {/* Success Animation */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2rem',
                animation: 'fadeInUp 0.6s ease'
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: '3rem',
                    boxShadow: '0 20px 50px rgba(16, 185, 129, 0.3)',
                    animation: 'pulse 2s infinite'
                }}>
                    ✓
                </div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>{texts.title}</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
                    {texts.subtitle}
                </p>
            </div>

            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Order Status Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {/* Order ID */}
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                {texts.orderId}
                            </div>
                            <div style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                fontFamily: 'monospace',
                                color: '#ff9800',
                                background: 'rgba(255,152,0,0.1)',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                display: 'inline-block'
                            }}>
                                #{orderId.slice(0, 8).toUpperCase()}
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                {texts.date}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                                {new Date(order.createdAt).toLocaleString(lang === 'fa' ? 'fa-IR' : lang === 'de' ? 'de-DE' : lang === 'sv' ? 'sv-SE' : 'en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                {texts.status}
                            </div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: `${statusInfo.color}20`,
                                color: statusInfo.color,
                                padding: '0.5rem 1rem',
                                borderRadius: '50px',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                <span>{statusInfo.icon}</span>
                                <span>{texts[order.status as keyof typeof texts] || order.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    marginBottom: '1.5rem'
                }}>
                    {/* Invoice Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,152,0,0.1), rgba(147,51,234,0.1))',
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                            📄 {texts.invoice}
                        </h2>
                        <PrintButton label={texts.print} />
                    </div>

                    {/* Items List */}
                    <div style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            {texts.items}
                        </div>

                        {order.items.map((item, idx) => (
                            <div key={item.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                            color: '#fff',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '8px',
                                            fontWeight: '700',
                                            fontSize: '0.9rem'
                                        }}>
                                            {item.quantity}x
                                        </span>
                                        <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                                            {getItemName(item)}
                                        </span>
                                    </div>
                                    {item.size && (
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.5rem', marginLeft: '3rem' }}>
                                            Size: {item.size}
                                        </div>
                                    )}
                                    {item.extras.length > 0 && (
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.25rem', marginLeft: '3rem' }}>
                                            + {item.extras.map(e => e.name).join(', ')}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontWeight: '600', color: '#ff9800' }}>
                                    {(Number(item.price) * item.quantity).toFixed(2)} {currencySymbol}
                                </div>
                            </div>
                        ))}

                        {/* Cost Summary */}
                        <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            marginTop: '1.5rem',
                            paddingTop: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                                <span>{texts.subtotal}</span>
                                <span>{itemsTotal.toFixed(2)} {currencySymbol}</span>
                            </div>

                            {deliveryFee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                                    <span>{texts.deliveryFee}</span>
                                    <span>{deliveryFee.toFixed(2)} {currencySymbol}</span>
                                </div>
                            )}

                            {tip > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#ff9800' }}>
                                    <span>{texts.tip}</span>
                                    <span>{tip.toFixed(2)} {currencySymbol}</span>
                                </div>
                            )}

                            {order.couponCode && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#4ade80' }}>
                                    <span>{texts.discount} ({order.couponCode})</span>
                                    <span>Applied</span>
                                </div>
                            )}

                            {/* Total */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '1rem',
                                marginTop: '1rem',
                                borderTop: '2px solid rgba(255,152,0,0.3)',
                                fontSize: '1.4rem',
                                fontWeight: '800'
                            }}>
                                <span>{texts.total}</span>
                                <span style={{
                                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {total.toFixed(2)} {currencySymbol}
                                </span>
                            </div>

                            {vatNumber && (
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'right' }}>
                                    {texts.vatNumber}: {vatNumber}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Delivery & Customer Info */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    {/* Customer Info */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            👤 {texts.customerInfo}
                        </h3>
                        <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
                            <div><strong>{addressInfo.name}</strong></div>
                            <div>📞 {addressInfo.phone}</div>
                            {addressInfo.email && <div>✉️ {addressInfo.email}</div>}
                        </div>
                    </div>

                    {/* Delivery Method & Address */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {order.deliveryMethod === 'DELIVERY' ? '🚚' : order.deliveryMethod === 'PICKUP' ? '🏪' : '🍽️'} {texts.deliveryMethod}
                        </h3>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(255,152,0,0.1)',
                            color: '#ff9800',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            marginBottom: '1rem'
                        }}>
                            {texts[order.deliveryMethod as keyof typeof texts] || order.deliveryMethod}
                        </div>

                        {order.deliveryMethod === 'DELIVERY' && addressInfo.street && (
                            <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                                <div>{addressInfo.street}</div>
                                <div>{addressInfo.zip} {addressInfo.city}</div>
                                {addressInfo.floor && <div>Floor: {addressInfo.floor}</div>}
                                {addressInfo.door && <div>Door: {addressInfo.door}</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Track Order Info */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
                    borderRadius: '20px',
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1px solid rgba(139,92,246,0.2)',
                    marginBottom: '2rem'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                        {texts.trackOrder}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                        {texts.trackText}
                    </p>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        fontFamily: 'monospace',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: '#a5b4fc',
                        display: 'inline-block'
                    }}>
                        #{orderId.toUpperCase()}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <Link
                        href={`/${lang}`}
                        style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                            border: 'none',
                            borderRadius: '50px',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '1rem',
                            textDecoration: 'none',
                            boxShadow: '0 8px 30px rgba(255, 152, 0, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🏠 {texts.returnHome}
                    </Link>
                    <Link
                        href={`/${lang}/menu`}
                        style={{
                            padding: '1rem 2rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50px',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '1rem',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🍕 {texts.viewMenu}
                    </Link>
                </div>
            </div>

            {/* Print Styles & Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 20px 50px rgba(16, 185, 129, 0.3);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 25px 60px rgba(16, 185, 129, 0.4);
                    }
                }
                
                @media print {
                    body { 
                        background: #fff !important; 
                        color: #000 !important;
                    }
                    #print-btn { display: none !important; }
                    a { color: #000 !important; }
                    div { 
                        background: #fff !important; 
                        color: #000 !important;
                        border-color: #ddd !important;
                    }
                }
            `}</style>
        </div>
    );
}
