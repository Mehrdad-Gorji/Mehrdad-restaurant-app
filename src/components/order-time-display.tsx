'use client';

import { useState, useEffect } from 'react';

interface OrderStatusDisplayProps {
    orderId: string;
    lang: string;
    initialStatus?: string;
}

interface OrderStatus {
    status: string;
    estimatedMinutes: number | null;
    confirmedAt: string | null;
}

// Combined component that shows both time and status dynamically
export default function OrderTimeDisplay({ orderId, lang, initialStatus }: OrderStatusDisplayProps) {
    const [status, setStatus] = useState<OrderStatus | null>(null);
    const [remaining, setRemaining] = useState<number | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}/status`);
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            } catch (e) {
                console.error('Failed to fetch status:', e);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 15000); // Fetch every 15 seconds
        return () => clearInterval(interval);
    }, [orderId]);

    useEffect(() => {
        if (!status?.confirmedAt || !status?.estimatedMinutes) {
            setRemaining(null);
            return;
        }

        const calculateRemaining = () => {
            const confirmedTime = new Date(status.confirmedAt!).getTime();
            const estimatedEnd = confirmedTime + (status.estimatedMinutes! * 60 * 1000);
            const now = Date.now();
            const rem = Math.max(0, Math.ceil((estimatedEnd - now) / 60000));
            setRemaining(rem);
        };

        calculateRemaining();
        const interval = setInterval(calculateRemaining, 10000);
        return () => clearInterval(interval);
    }, [status]);

    const currentStatus = status?.status || initialStatus;

    // Don't show timer for completed/cancelled
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
        return null;
    }

    // Waiting for confirmation (no estimated time set)
    if (status && !status.estimatedMinutes) {
        return (
            <span style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#f59e0b',
                padding: '0.6rem 1.5rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700'
            }}>
                🕐 {lang === 'fa' ? 'در انتظار' : 'Waiting'}
            </span>
        );
    }

    // Show remaining time countdown
    if (remaining !== null && remaining > 0) {
        return (
            <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                padding: '0.6rem 1.5rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700'
            }}>
                ⏱️ {remaining} min
            </span>
        );
    }

    // Ready (time elapsed)
    if (remaining === 0) {
        return (
            <span style={{
                background: 'rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                padding: '0.6rem 1.5rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700'
            }}>
                🎉 {lang === 'fa' ? 'آماده!' : 'Ready!'}
            </span>
        );
    }

    return null;
}

// Separate component that also updates the status badge
export function OrderStatusBadge({ orderId, initialStatus }: { orderId: string; initialStatus: string }) {
    const [status, setStatus] = useState<string>(initialStatus);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}/status`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status) {
                        setStatus(data.status);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch status:', e);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);
        return () => clearInterval(interval);
    }, [orderId]);

    const getStatusStyle = (st: string) => {
        switch (st) {
            case 'COMPLETED':
                return { background: 'rgba(76,175,80,0.2)', color: '#4caf50' };
            case 'CANCELLED':
                return { background: 'rgba(244,67,54,0.2)', color: '#f44336' };
            case 'PREPARING':
                return { background: 'rgba(255,152,0,0.2)', color: '#ff9800' };
            case 'DELIVERING':
                return { background: 'rgba(16,185,129,0.2)', color: '#10b981' };
            case 'PAID':
                return { background: 'rgba(59,130,246,0.2)', color: '#3b82f6' };
            default:
                return { background: 'rgba(255,152,0,0.2)', color: '#ff9800' };
        }
    };

    const styles = getStatusStyle(status);

    return (
        <span style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: '600',
            background: styles.background,
            color: styles.color
        }}>
            {status}
        </span>
    );
}
