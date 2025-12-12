'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { calculateVAT, VATSettings, DEFAULT_VAT_SETTINGS } from '@/lib/vat';
import { isShopOpen } from '@/lib/shop-status';

export default function CheckoutForm({ dictionary }: { dictionary?: any }) {
    const { items, total, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // VAT settings
    const [vatSettings, setVatSettings] = useState<VATSettings>(DEFAULT_VAT_SETTINGS);

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP' | 'DINE_IN'>('DELIVERY');
    const [address, setAddress] = useState({
        street: '',
        city: 'Stockholm',
        zip: '',
        floor: '',
        door: ''
    });
    const [paymentMethod, setPaymentMethod] = useState<'SWISH' | 'CARD'>('SWISH');

    // Delivery Fee State
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [deliveryError, setDeliveryError] = useState('');

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

    // Tipping State
    const [tipAmount, setTipAmount] = useState(0);
    const [customTip, setCustomTip] = useState('');

    // Auto-fill form with logged-in user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.user) {
                    setUserId(data.user.id);
                    if (data.user.name) setName(data.user.name);
                    if (data.user.email) setEmail(data.user.email);
                    if (data.user.phone) setPhone(data.user.phone);

                    // Fetch user's saved addresses
                    const addrRes = await fetch('/api/auth/addresses');
                    const addrData = await addrRes.json();
                    if (addrData.addresses && addrData.addresses.length > 0) {
                        const firstAddr = addrData.addresses[0];
                        setAddress({
                            street: firstAddr.street || '',
                            city: firstAddr.city || 'Stockholm',
                            zip: firstAddr.zipCode || '',
                            floor: firstAddr.floor || '',
                            door: firstAddr.doorCode || ''
                        });
                    }
                }
            } catch { }
        };
        fetchUserData();
    }, []);

    // Load VAT settings & Shop Status
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();

                    setVatSettings({
                        vatEnabled: data.vatEnabled ?? true,
                        vatNumber: data.vatNumber ?? '',
                        vatRateStandard: data.vatRateStandard ?? 0.19,
                        vatRateReduced: data.vatRateReduced ?? 0.07,
                        vatPriceInclusive: data.vatPriceInclusive ?? true,
                    });

                    // Shop Status Check
                    const status = isShopOpen(data.operatingSchedule, data.scheduleEnabled ?? false);
                    if (!status.isOpen) {
                        alert(`Store is closed! ${status.message}`);
                        router.push('/en/cart');
                    }
                }
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        };
        loadSettings();
    }, [router]);

    // Debounce zip check
    useEffect(() => {
        if (deliveryMethod === 'PICKUP' || deliveryMethod === 'DINE_IN') {
            setDeliveryFee(0);
            setDeliveryError('');
            return;
        }

        const checkDelivery = async () => {
            if (address.zip.length < 5) return;
            try {
                const res = await fetch(`/api/delivery/check?zip=${address.zip}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.available) {
                        setDeliveryFee(data.price);
                        setDeliveryError('');
                    } else {
                        setDeliveryFee(0);
                        setDeliveryError('We do not deliver to this zip code.');
                    }
                }
            } catch (e) { console.error(e); }
        };

        const timer = setTimeout(checkDelivery, 500);
        return () => clearTimeout(timer);
    }, [address.zip, deliveryMethod]);

    // Fetch User Coupons
    useEffect(() => {
        if (!userId) return;
        fetch(`/api/user/coupons?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.coupons) setAvailableCoupons(data.coupons);
            })
            .catch(err => console.error(err));
    }, [userId]);



    // Scheduling State
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleTime, setScheduleTime] = useState('');

    const applyCoupon = async () => {
        if (!couponCode) return;
        setCouponMessage(dictionary?.checkout?.validating || 'Validating...');
        try {
            const res = await fetch(`/api/coupons/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode,
                    items: items.map(p => ({
                        productId: p.productId,
                        quantity: p.quantity,
                        price: p.price
                    })),
                    deliveryFee,
                    userId
                })
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setCouponDiscount(data.discount);
                setCouponMessage(`${dictionary?.checkout?.couponApplied || 'Coupon applied'}: -${data.discount} SEK`);
                setIsCouponApplied(true);
            } else {
                setCouponDiscount(0);
                setIsCouponApplied(false);
                setCouponMessage(data.message || dictionary?.checkout?.invalidCoupon || 'Invalid coupon');
            }
        } catch (e) {
            setCouponMessage(dictionary?.checkout?.errorValidating || 'Error validating coupon');
        }
    };


    if (items.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '6rem 2rem',
                background: '#0a0a0a',
                minHeight: '100vh',
                color: '#fff'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your cart is empty</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Add some delicious items to your cart!</p>
                <button
                    onClick={() => router.push('/en/menu')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                        border: 'none',
                        borderRadius: '50px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    // Calculate amounts after coupon discount
    // Coupon applies to food items (not delivery fee)
    const foodAfterDiscount = Math.max(0, total - couponDiscount);

    // VAT Calculations (on discounted amounts)
    // Food items: reduced rate (7% DE, 12% SE) - calculated on discounted food amount
    const foodVAT = vatSettings.vatEnabled
        ? calculateVAT(foodAfterDiscount, vatSettings.vatRateReduced, vatSettings.vatPriceInclusive)
        : { gross: foodAfterDiscount, net: foodAfterDiscount, vat: 0, rate: 0 };

    // Delivery fee: standard rate (19% DE, 25% SE) - unchanged
    const deliveryVAT = vatSettings.vatEnabled && deliveryMethod === 'DELIVERY' && deliveryFee > 0
        ? calculateVAT(deliveryFee, vatSettings.vatRateStandard, vatSettings.vatPriceInclusive)
        : { gross: deliveryFee, net: deliveryFee, vat: 0, rate: 0 };

    const finalTotal = Math.max(0, foodAfterDiscount + deliveryFee + tipAmount);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deliveryError) return;
        setLoading(true);

        const payload = {
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                sizeName: item.sizeName,
                extras: item.extras
            })),
            customer: { name, phone, email },
            deliveryMethod,
            address: deliveryMethod === 'DELIVERY' ? address : null,
            tableNumber: deliveryMethod === 'DINE_IN' ? 'TBD' : null,
            paymentMethod,
            total: finalTotal,
            couponCode: isCouponApplied ? couponCode : null,
            userId: userId,
            isScheduled,
            requestedTime: isScheduled ? scheduleTime : null,
            tip: tipAmount
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                clearCart();
                router.push(`/checkout/success?orderId=${data.orderId}`);
            } else {
                alert(data.details || data.error || 'Failed to submit order');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const cardStyle = {
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '2rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem 1.25rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s ease'
    };

    const sectionTitleStyle = {
        fontSize: '1.1rem',
        fontWeight: '600' as const,
        color: '#fff',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            position: 'relative',
            paddingTop: '2rem',
            paddingBottom: '4rem'
        }}>
            {/* Background Gradient Orbs */}
            <div style={{
                position: 'fixed',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none',
                zIndex: 0
            }} />
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
                bottom: '0',
                left: '-100px',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="container" style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2rem',
                alignItems: 'start'
            }}>
                {/* Form Column */}
                <div style={{ ...cardStyle, flex: '1 1 500px', minWidth: '0' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        marginBottom: '2rem',
                        background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{dictionary?.checkout?.title || "Checkout"}</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Contact Info */}
                        <section>
                            <h3 style={sectionTitleStyle}>
                                <span style={{ fontSize: '1.2rem' }}>👤</span>
                                {dictionary?.checkout?.contactInfo || "Contact Information"}
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input
                                    required
                                    className="dark-input"
                                    placeholder={dictionary?.checkout?.fullName || "Full Name"}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                                <input
                                    required
                                    className="dark-input"
                                    placeholder={dictionary?.checkout?.phone || "Phone Number"}
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                                <input
                                    className="dark-input"
                                    placeholder={dictionary?.checkout?.email || "Email (Optional)"}
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </section>

                        {/* Delivery Method */}
                        <section>
                            <h3 style={sectionTitleStyle}>
                                <span style={{ fontSize: '1.2rem' }}>📦</span>
                                {dictionary?.checkout?.deliveryMethod || "Delivery Method"}
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {/* Delivery Option */}
                                <label style={{
                                    flex: '1 1 100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    padding: '1.5rem 1rem',
                                    background: deliveryMethod === 'DELIVERY'
                                        ? 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,87,34,0.1))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: deliveryMethod === 'DELIVERY'
                                        ? '2px solid rgba(255,152,0,0.5)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <input type="radio" name="delivery" checked={deliveryMethod === 'DELIVERY'} onChange={() => setDeliveryMethod('DELIVERY')} style={{ display: 'none' }} />
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13" />
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    <span style={{ fontWeight: '600', color: deliveryMethod === 'DELIVERY' ? '#ff9800' : 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{dictionary?.checkout?.delivery || "Delivery"}</span>
                                </label>

                                {/* Pickup Option */}
                                <label style={{
                                    flex: '1 1 100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    padding: '1.5rem 1rem',
                                    background: deliveryMethod === 'PICKUP'
                                        ? 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,87,34,0.1))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: deliveryMethod === 'PICKUP'
                                        ? '2px solid rgba(255,152,0,0.5)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <input type="radio" name="delivery" checked={deliveryMethod === 'PICKUP'} onChange={() => setDeliveryMethod('PICKUP')} style={{ display: 'none' }} />
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                    <span style={{ fontWeight: '600', color: deliveryMethod === 'PICKUP' ? '#ff9800' : 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{dictionary?.checkout?.pickup || "Pickup"}</span>
                                </label>

                                {/* Dine In Option */}
                                <label style={{
                                    flex: '1 1 100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    padding: '1.5rem 1rem',
                                    background: deliveryMethod === 'DINE_IN'
                                        ? 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,87,34,0.1))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: deliveryMethod === 'DINE_IN'
                                        ? '2px solid rgba(255,152,0,0.5)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <input type="radio" name="delivery" checked={deliveryMethod === 'DINE_IN'} onChange={() => setDeliveryMethod('DINE_IN')} style={{ display: 'none' }} />
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                                        <path d="M7 2v20" />
                                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                                    </svg>
                                    <span style={{ fontWeight: '600', color: deliveryMethod === 'DINE_IN' ? '#ff9800' : 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{dictionary?.checkout?.dineIn || "Dine In"}</span>
                                </label>
                            </div>
                        </section>

                        {/* Address (Conditional) */}
                        {deliveryMethod === 'DELIVERY' && (
                            <section style={{ animation: 'fadeIn 0.3s ease' }}>
                                <h3 style={sectionTitleStyle}>
                                    <span style={{ fontSize: '1.2rem' }}>📍</span>
                                    {dictionary?.checkout?.address || "Delivery Address"}
                                </h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <input
                                        required
                                        className="dark-input"
                                        placeholder={dictionary?.checkout?.street || "Street Address"}
                                        value={address.street}
                                        onChange={e => setAddress({ ...address, street: e.target.value })}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <input
                                                required
                                                className="dark-input"
                                                placeholder={dictionary?.checkout?.zip || "Zip Code"}
                                                value={address.zip}
                                                onChange={e => setAddress({ ...address, zip: e.target.value })}
                                            />
                                            {deliveryError && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '0.5rem' }}>{deliveryError}</div>}
                                        </div>
                                        <input
                                            required
                                            className="dark-input"
                                            placeholder={dictionary?.checkout?.city || "City"}
                                            value={address.city}
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input
                                            className="dark-input"
                                            placeholder={dictionary?.checkout?.floor || "Floor (Optional)"}
                                            value={address.floor}
                                            onChange={e => setAddress({ ...address, floor: e.target.value })}
                                        />
                                        <input
                                            className="dark-input"
                                            placeholder={dictionary?.checkout?.door || "Door Code (Optional)"}
                                            value={address.door}
                                            onChange={e => setAddress({ ...address, door: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Order Scheduling */}
                        <section>
                            <h3 style={sectionTitleStyle}>
                                <span style={{ fontSize: '1.2rem' }}>🕒</span>
                                {dictionary?.checkout?.orderTime || "Order Time"}
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label style={{
                                        flex: 1, padding: '1rem',
                                        background: !isScheduled ? 'rgba(255,152,0,0.1)' : 'rgba(255,255,255,0.03)',
                                        border: !isScheduled ? '1px solid #ff9800' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', color: !isScheduled ? '#ff9800' : '#fff'
                                    }}>
                                        <input type="radio" checked={!isScheduled} onChange={() => setIsScheduled(false)} style={{ display: 'none' }} />
                                        ⚡ {dictionary?.checkout?.asap || "ASAP"}
                                    </label>
                                    <label style={{
                                        flex: 1, padding: '1rem',
                                        background: isScheduled ? 'rgba(255,152,0,0.1)' : 'rgba(255,255,255,0.03)',
                                        border: isScheduled ? '1px solid #ff9800' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', color: isScheduled ? '#ff9800' : '#fff'
                                    }}>
                                        <input type="radio" checked={isScheduled} onChange={() => setIsScheduled(true)} style={{ display: 'none' }} />
                                        📅 {dictionary?.checkout?.schedule || "Schedule for Later"}
                                    </label>
                                </div>
                                {isScheduled && (
                                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{dictionary?.checkout?.selectDateTime || "Select Date & Time"}</label>
                                        <input
                                            type="datetime-local"
                                            required={isScheduled}
                                            className="dark-input"
                                            style={{ ...inputStyle, colorScheme: 'dark' }}
                                            value={scheduleTime}
                                            onChange={e => setScheduleTime(e.target.value)}
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section>
                            <h3 style={sectionTitleStyle}>
                                <span style={{ fontSize: '1.2rem' }}>💳</span>
                                {dictionary?.checkout?.paymentMethod || "Payment Method"}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    padding: '1.25rem',
                                    background: paymentMethod === 'SWISH'
                                        ? 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,87,34,0.1))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: paymentMethod === 'SWISH'
                                        ? '2px solid rgba(255,152,0,0.5)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <input type="radio" name="payment" checked={paymentMethod === 'SWISH'} onChange={() => setPaymentMethod('SWISH')} style={{ display: 'none' }} />
                                    <span style={{ fontSize: '1.5rem' }}>📱</span>
                                    <span style={{ fontWeight: '600', color: paymentMethod === 'SWISH' ? '#ff9800' : 'rgba(255,255,255,0.7)' }}>Swish</span>
                                </label>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    padding: '1.25rem',
                                    background: paymentMethod === 'CARD'
                                        ? 'linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,87,34,0.1))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: paymentMethod === 'CARD'
                                        ? '2px solid rgba(255,152,0,0.5)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <input type="radio" name="payment" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} style={{ display: 'none' }} />
                                    <span style={{ fontSize: '1.5rem' }}>💳</span>
                                    <span style={{ fontWeight: '600', color: paymentMethod === 'CARD' ? '#ff9800' : 'rgba(255,255,255,0.7)' }}>Card</span>
                                </label>
                            </div>
                        </section>

                        <button
                            type="submit"
                            disabled={loading || !!deliveryError}
                            style={{
                                marginTop: '1rem',
                                padding: '1.25rem 2rem',
                                background: (loading || !!deliveryError)
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'linear-gradient(135deg, #ff9800, #ff5722)',
                                border: 'none',
                                borderRadius: '16px',
                                color: '#fff',
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                cursor: (loading || !!deliveryError) ? 'not-allowed' : 'pointer',
                                opacity: (loading || !!deliveryError) ? 0.5 : 1,
                                boxShadow: (loading || !!deliveryError) ? 'none' : '0 8px 30px rgba(255, 152, 0, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? (dictionary?.checkout?.processing || "Processing...") : `${dictionary?.checkout?.pay || "Pay"} ${finalTotal.toFixed(2)} SEK`}
                        </button>

                    </form>
                </div>

                {/* Order Summary Column */}
                <div style={{
                    ...cardStyle,
                    flex: '1 1 300px',
                    minWidth: '0',
                    background: 'linear-gradient(135deg, rgba(255,152,0,0.05), rgba(147,51,234,0.05))',
                    height: 'fit-content',
                    position: 'sticky',
                    top: '100px'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '1.5rem',
                        color: '#fff'
                    }}>{dictionary?.cart?.summary || "Order Summary"}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map(item => (
                            <div key={item.uniqueId} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.95rem',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px'
                            }}>
                                <div>
                                    <span style={{ fontWeight: '600', color: '#ff9800' }}>{item.quantity}x</span>
                                    <span style={{ color: '#fff', marginLeft: '0.5rem' }}>{item.name}</span>
                                    {item.sizeName && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Size: {item.sizeName}</div>}
                                    {item.extras && item.extras.length > 0 && (
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                                            + {item.extras.map(e => e.name).join(', ')}
                                        </div>
                                    )}
                                </div>
                                <span style={{ color: '#fff', fontWeight: '500' }}>{(item.price * item.quantity).toFixed(2)} SEK</span>
                            </div>
                        ))}

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

                        {/* Cost Breakdown - Consolidated View */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            {/* Subtotal */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                                <span>{dictionary?.checkout?.subtotal || "Subtotal"}</span>
                                <span>{total.toFixed(2)} SEK</span>
                            </div>

                            {/* Delivery Fee */}
                            {deliveryMethod === 'DELIVERY' && deliveryFee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                                    <span>{dictionary?.checkout?.deliveryFee || "Delivery Fee"}</span>
                                    <span>{deliveryFee.toFixed(2)} SEK</span>
                                </div>
                            )}

                            {/* Discount */}
                            {isCouponApplied && couponDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontSize: '0.95rem' }}>
                                    <span>{dictionary?.checkout?.discount || "Discount"} ({couponCode})</span>
                                    <span>-{couponDiscount.toFixed(2)} SEK</span>
                                </div>
                            )}

                            {/* Tip */}
                            {tipAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff9800', fontSize: '0.95rem' }}>
                                    <span>{dictionary?.checkout?.driverTip || "Driver Tip"}</span>
                                    <span>{tipAmount.toFixed(2)} SEK</span>
                                </div>
                            )}
                        </div>

                        {/* VAT Breakdown */}
                        {vatSettings.vatEnabled && vatSettings.vatPriceInclusive && (
                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>💰 {dictionary?.checkout?.vatBreakdown || "VAT Breakdown (Included)"}</div>

                                {/* Food VAT */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                    <span>{dictionary?.checkout?.foodNet || "Food Net"}</span>
                                    <span>{foodVAT.net.toFixed(2)} SEK</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                    <span>{dictionary?.checkout?.foodVat || "Food VAT"} ({(vatSettings.vatRateReduced * 100).toFixed(0)}%)</span>
                                    <span>{foodVAT.vat.toFixed(2)} SEK</span>
                                </div>

                                {/* Delivery VAT (only if delivery) */}
                                {deliveryMethod === 'DELIVERY' && deliveryFee > 0 && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                            <span>{dictionary?.checkout?.deliveryNet || "Delivery Net"}</span>
                                            <span>{deliveryVAT.net.toFixed(2)} SEK</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                            <span>{dictionary?.checkout?.deliveryVat || "Delivery VAT"} ({(vatSettings.vatRateStandard * 100).toFixed(0)}%)</span>
                                            <span>{deliveryVAT.vat.toFixed(2)} SEK</span>
                                        </div>
                                    </>
                                )}

                                {/* Total VAT */}
                                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', color: '#ff9800', fontSize: '0.9rem', fontWeight: '600' }}>
                                    <span>{dictionary?.checkout?.totalVat || "Total VAT"}</span>
                                    <span>{(foodVAT.vat + deliveryVAT.vat).toFixed(2)} SEK</span>
                                </div>
                            </div>
                        )}



                        {/* Coupon Input */}
                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    style={{
                                        ...inputStyle,
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.9rem'
                                    }}
                                    placeholder={dictionary?.checkout?.couponCode || "Coupon Code"}
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={applyCoupon}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {dictionary?.checkout?.apply || "Apply"}
                                </button>
                            </div>
                            {couponMessage && (
                                <div style={{
                                    fontSize: '0.8rem',
                                    marginTop: '0.5rem',
                                    color: isCouponApplied ? '#4ade80' : '#ff6b6b'
                                }}>
                                    {couponMessage}
                                </div>
                            )}

                            {/* Available Coupons List */}
                            {availableCoupons.length > 0 && !isCouponApplied && (
                                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeIn 0.5s ease' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
                                        🎟 {dictionary?.checkout?.availableCoupons || "Available Coupons"}:
                                    </div>
                                    {availableCoupons.map((c) => (
                                        <div
                                            key={c.code}
                                            onClick={() => { setCouponCode(c.code); }}
                                            style={{
                                                padding: '0.75rem',
                                                background: 'rgba(255,152,0,0.1)',
                                                border: '1px dashed #ff9800',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            className="hover:bg-orange-900/20"
                                        >
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#ff9800' }}>{c.code}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{c.desc}</div>
                                                {c.products && c.products.length > 0 && (
                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                                                        Valid on: {c.products.slice(0, 2).join(', ')}{c.products.length > 2 ? '...' : ''}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ color: '#fff', fontSize: '0.8rem', opacity: 0.7 }}>Tap to use</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Driver Tip Section */}
                        {deliveryMethod === 'DELIVERY' && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>💸</span> {dictionary?.checkout?.addTip || "Add a tip for the driver"}
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {[0.05, 0.10, 0.15].map((pct) => {
                                        const amt = Math.round(total * pct);
                                        return (
                                            <button
                                                key={pct}
                                                type="button"
                                                onClick={() => { setTipAmount(amt); setCustomTip(''); }}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: tipAmount === amt ? '#ff9800' : 'rgba(255,255,255,0.05)',
                                                    color: tipAmount === amt ? '#000' : '#fff',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {pct * 100}% ({amt} kr)
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        placeholder={dictionary?.checkout?.customAmount || "Custom amount"}
                                        value={customTip}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomTip(val);
                                            setTipAmount(Number(val));
                                        }}
                                        style={{
                                            ...inputStyle,
                                            padding: '0.5rem',
                                            fontSize: '0.9rem',
                                            width: '100%'
                                        }}
                                    />
                                    {tipAmount > 0 && <button type="button" onClick={() => { setTipAmount(0); setCustomTip(''); }} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>✕</button>}
                                </div>
                            </div>
                        )}



                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: '700',
                            fontSize: '1.4rem',
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '2px solid rgba(255,152,0,0.3)'
                        }}>
                            <span style={{ color: '#fff' }}>{dictionary?.checkout?.total || "Total"}</span>
                            <span style={{
                                background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>{finalTotal.toFixed(2)} SEK</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
