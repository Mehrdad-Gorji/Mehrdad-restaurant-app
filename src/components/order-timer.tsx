'use client';

import { useState, useEffect } from 'react';

interface OrderTimerProps {
    orderId: string;
    lang: string;
}

interface OrderStatus {
    status: string;
    estimatedMinutes: number | null;
    confirmedAt: string | null;
}

export default function OrderTimer({ orderId, lang }: OrderTimerProps) {
    const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
    const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch order status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}/status`);
                if (res.ok) {
                    const data = await res.json();
                    setOrderStatus(data);
                }
            } catch (e) {
                console.error('Failed to fetch order status:', e);
            }
            setLoading(false);
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [orderId]);

    // Calculate remaining time
    useEffect(() => {
        if (!orderStatus?.confirmedAt || !orderStatus?.estimatedMinutes) {
            setRemainingMinutes(null);
            return;
        }

        const calculateRemaining = () => {
            const confirmedTime = new Date(orderStatus.confirmedAt!).getTime();
            const estimatedEnd = confirmedTime + (orderStatus.estimatedMinutes! * 60 * 1000);
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((estimatedEnd - now) / 60000));
            setRemainingMinutes(remaining);
        };

        calculateRemaining();
        const interval = setInterval(calculateRemaining, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, [orderStatus]);

    if (loading) {
        return (
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '24px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
            }}>
                <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading status...</div>
            </div>
        );
    }

    // Order completed or cancelled
    if (orderStatus?.status === 'COMPLETED' || orderStatus?.status === 'CANCELLED') {
        return null;
    }

    // Waiting for confirmation
    if (!orderStatus?.estimatedMinutes) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15))',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '24px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕐</div>
                <div style={{ color: '#f59e0b', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {lang === 'fa' ? 'در انتظار تأیید...' : 'Waiting for confirmation...'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    {lang === 'fa' ? 'سفارش شما به رستوران ارسال شد. لطفا منتظر بمانید.' : 'Your order has been sent to the restaurant. Please wait.'}
                </div>
            </div>
        );
    }

    // Order confirmed with estimated time
    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏱️</div>
            <div style={{ color: '#10b981', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {lang === 'fa' ? 'سفارش شما تأیید شد!' : 'Your order is confirmed!'}
            </div>

            {remainingMinutes !== null && remainingMinutes > 0 ? (
                <>
                    <div style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
                        {lang === 'fa' ? 'زمان باقیمانده:' : 'Time remaining:'}
                    </div>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        {remainingMinutes} {lang === 'fa' ? 'دقیقه' : 'min'}
                    </div>
                </>
            ) : remainingMinutes === 0 ? (
                <>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: '#10b981',
                        marginBottom: '0.5rem'
                    }}>
                        🎉 {lang === 'fa' ? 'آماده!' : 'Ready!'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        {lang === 'fa' ? 'سفارش شما آماده است' : 'Your order is ready'}
                    </div>
                </>
            ) : (
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {lang === 'fa' ? 'زمان تخمینی:' : 'Estimated:'} {orderStatus.estimatedMinutes} {lang === 'fa' ? 'دقیقه' : 'min'}
                </div>
            )}

            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                {lang === 'fa' ? 'وضعیت:' : 'Status:'} {orderStatus.status}
            </div>
        </div>
    );
}
