'use client';

import { useMemo } from 'react';

interface Order {
    status: string;
    isScheduled?: boolean;
    requestedTime?: string | null;
    createdAt: string;
    completedAt?: string | null;
    estimatedMinutes?: number | null;
}

export default function DailyPerformanceWidget({ orders }: { orders: Order[] }) {
    const stats = useMemo(() => {
        const completedToday = orders.filter(o => {
            if (o.status !== 'COMPLETED' || !o.completedAt) return false;
            const completedDate = new Date(o.completedAt);
            const today = new Date();
            return completedDate.getDate() === today.getDate() &&
                completedDate.getMonth() === today.getMonth() &&
                completedDate.getFullYear() === today.getFullYear();
        });

        const totalCompleted = completedToday.length;
        if (totalCompleted === 0) {
            return { total: 0, onTimePct: 0, avgDeviation: 0, status: 'N/A' };
        }

        let onTimeCount = 0;
        let totalDeviation = 0;

        completedToday.forEach(order => {
            let targetTime = 0;
            if (order.isScheduled && order.requestedTime) {
                targetTime = new Date(order.requestedTime).getTime();
            } else {
                const estimate = order.estimatedMinutes || 45;
                targetTime = new Date(order.createdAt).getTime() + (estimate * 60 * 1000);
            }

            const completedTime = new Date(order.completedAt!).getTime();
            const diffMinutes = (completedTime - targetTime) / 1000 / 60;

            totalDeviation += diffMinutes;

            if (diffMinutes <= 5) {
                onTimeCount++;
            }
        });

        const onTimePct = Math.round((onTimeCount / totalCompleted) * 100);
        const avgDeviation = Math.round(totalDeviation / totalCompleted);

        return { total: totalCompleted, onTimePct, avgDeviation };
    }, [orders]);

    const statCards = [
        {
            icon: '📊',
            label: 'Processed Today',
            value: `${stats.total} Orders`,
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        },
        {
            icon: '🎯',
            label: 'On-Time Rate',
            value: `${stats.onTimePct}%`,
            gradient: stats.onTimePct >= 80
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : stats.onTimePct >= 50
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        },
        {
            icon: '⚡',
            label: 'Avg. Performance',
            value: stats.avgDeviation > 0 ? `${stats.avgDeviation}m Late` : `${Math.abs(stats.avgDeviation)}m Early`,
            gradient: stats.avgDeviation <= 0
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        }
    ];

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '20px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
        }}>
            {statCards.map((stat, idx) => (
                <div key={idx} style={{
                    background: stat.gradient,
                    borderRadius: '16px',
                    padding: '1.25rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-15px',
                        right: '-15px',
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '50%'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            {stat.icon}
                        </div>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.25rem'
                        }}>
                            {stat.label}
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: '#fff'
                        }}>
                            {stat.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
