'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { printOrder, printOrderQZ, connectQZ } from './order-receipt';
import DailyPerformanceWidget from './daily-report-widget';

interface Order {
    id: string;
    status: string;
    total: number;
    deliveryMethod: string;
    estimatedMinutes: number | null;

    confirmedAt: string | null;
    completedAt?: string | null; // Added for punctuality tracking
    createdAt: string;
    isScheduled?: boolean;
    requestedTime?: string | null;
    addressJson: string | null;
    items: any[];
}

const TIME_OPTIONS = [
    { value: 15, label: '15m', icon: '⚡' },
    { value: 20, label: '20m', icon: '🔥' },
    { value: 30, label: '30m', icon: '⏰' },
    { value: 45, label: '45m', icon: '🍕' },
    { value: 60, label: '1h', icon: '📦' },
    { value: 90, label: '1.5h', icon: '🚚' },
];

export default function AdminOrdersLive() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const lastOrderIdsRef = useRef<Set<string>>(new Set());
    const isFirstLoadRef = useRef(true);
    const soundEnabledRef = useRef(true);

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
    const [settingEstimate, setSettingEstimate] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [autoPrint, setAutoPrint] = useState(true);
    const [printerConnected, setPrinterConnected] = useState(false);
    const [currencySymbol, setCurrencySymbol] = useState('kr');
    const autoPrintRef = useRef(true);

    useEffect(() => {
        soundEnabledRef.current = soundEnabled;
    }, [soundEnabled]);

    useEffect(() => {
        autoPrintRef.current = autoPrint;
    }, [autoPrint]);

    // Fetch currency symbol from settings
    useEffect(() => {
        fetch('/api/site-settings')
            .then(res => res.json())
            .then(data => {
                if (data?.currencySymbol) {
                    setCurrencySymbol(data.currencySymbol);
                }
            })
            .catch(console.error);
    }, []);

    const initAudio = useCallback(() => {
        if (!audioContextRef.current && typeof window !== 'undefined') {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error('Failed to create audio context:', e);
            }
        }
        return audioContextRef.current;
    }, []);

    const playNotificationSound = useCallback(() => {
        try {
            const ctx = initAudio();
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();

            const playChime = (startTime: number) => {
                [523, 659, 784].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    const noteStart = startTime + (idx * 0.08);
                    gain.gain.setValueAtTime(0, noteStart);
                    gain.gain.linearRampToValueAtTime(0.3, noteStart + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 1.0);
                    osc.start(noteStart);
                    osc.stop(noteStart + 1.0);
                });
            };

            playChime(ctx.currentTime);
            playChime(ctx.currentTime + 1.8);
            playChime(ctx.currentTime + 3.6);
            console.log('🔔 Sound playing');
        } catch (e) {
            console.error('Sound error:', e);
        }
    }, [initAudio]);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();

                if (!isFirstLoadRef.current && lastOrderIdsRef.current.size > 0) {
                    const newOrders = data.filter((o: Order) => !lastOrderIdsRef.current.has(o.id));
                    if (newOrders.length > 0) {
                        console.log('🆕 NEW ORDER!', newOrders.map((o: Order) => o.id));
                        if (soundEnabledRef.current) playNotificationSound();
                        setNewOrderIds(prev => new Set([...prev, ...newOrders.map((o: Order) => o.id)]));

                        // Auto-print new orders via QZ Tray (silent)
                        if (autoPrintRef.current) {
                            newOrders.forEach((order: Order) => {
                                console.log('🖨️ Auto-printing order:', order.id);
                                printOrderQZ(order); // Silent print via QZ Tray
                            });
                        }
                    }
                }

                lastOrderIdsRef.current = new Set(data.map((o: Order) => o.id));
                setOrders(data);

                if (isFirstLoadRef.current) {
                    isFirstLoadRef.current = false;
                    console.log('📦 Loaded', data.length, 'orders');
                }
            }
        } catch (e) {
            console.error('Fetch error:', e);
        }
        setLoading(false);
    }, [playNotificationSound]);

    const setEstimatedTime = async (orderId: string, minutes: number) => {
        setSettingEstimate(orderId);
        try {
            const res = await fetch('/api/admin/orders/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, estimatedMinutes: minutes })
            });
            if (res.ok) {
                setNewOrderIds(prev => { const next = new Set(prev); next.delete(orderId); return next; });
                await fetchOrders();
            }
        } catch (e) {
            console.error('Estimate error:', e);
        }
        setSettingEstimate(null);
    };

    const updateStatus = async (orderId: string, status: string) => {
        // Optimistic update
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                const updates: any = { status };
                if (status === 'COMPLETED') {
                    updates.completedAt = new Date().toISOString();
                }
                return { ...o, ...updates };
            }
            return o;
        }));

        try {
            await fetch('/api/admin/orders/' + orderId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchOrders();
        } catch (e) {
            console.error('Update error:', e);
            fetchOrders(); // Revert on error
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!window.confirm('Delete this order?')) return;
        try {
            const res = await fetch('/api/admin/orders/' + orderId, { method: 'DELETE' });
            if (res.ok) {
                if (expandedOrder === orderId) setExpandedOrder(null);
                await fetchOrders();
            }
        } catch (e) {
            console.error('Delete error:', e);
        }
    };

    useEffect(() => {
        const handleClick = () => initAudio();
        document.addEventListener('click', handleClick, { once: true });
        return () => document.removeEventListener('click', handleClick);
    }, [initAudio]);

    // Connect to QZ Tray on mount for silent printing
    // User needs to click Allow once per browser session
    useEffect(() => {
        if (autoPrint) {
            connectQZ().then(connected => {
                setPrinterConnected(connected);
                if (connected) {
                    console.log('🖨️ QZ Tray ready for auto-print');
                } else {
                    console.warn('⚠️ QZ Tray not available - will use browser print');
                }
            });
        }
    }, [autoPrint]);

    // Manual connect printer function
    const handleConnectPrinter = useCallback(async () => {
        const connected = await connectQZ();
        setPrinterConnected(connected);
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const parseAddress = (json: string | null) => {
        try { return json ? JSON.parse(json) : {}; } catch { return {}; }
    };

    const getRemainingTime = (order: Order) => {
        if (!order.confirmedAt || !order.estimatedMinutes) return null;
        const confirmed = new Date(order.confirmedAt).getTime();
        const end = confirmed + (order.estimatedMinutes * 60 * 1000);
        return Math.max(0, Math.ceil((end - Date.now()) / 60000));
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return { bg: '#fef3c7', color: '#d97706', icon: '🆕' };
            case 'PAID': return { bg: '#dbeafe', color: '#2563eb', icon: '💳' };
            case 'PREPARING': return { bg: '#fed7aa', color: '#ea580c', icon: '👨‍🍳' };
            case 'DELIVERING': return { bg: '#d1fae5', color: '#059669', icon: '🛵' };
            case 'COMPLETED': return { bg: '#dcfce7', color: '#16a34a', icon: '✅' };
            case 'CANCELLED': return { bg: '#fee2e2', color: '#dc2626', icon: '❌' };
            default: return { bg: '#f3f4f6', color: '#6b7280', icon: '📦' };
        }
    };

    const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);
    const statusCounts = {
        ALL: orders.length,
        PENDING: orders.filter(o => o.status === 'PENDING').length,
        PREPARING: orders.filter(o => o.status === 'PREPARING').length,
        DELIVERING: orders.filter(o => o.status === 'DELIVERING').length,
        COMPLETED: orders.filter(o => o.status === 'COMPLETED').length,
        CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;

    return (
        <div style={{ color: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        margin: '0',
                        background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>📦 Live Orders</h1>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Real-time order management</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Printer Status Indicator */}
                    <button
                        onClick={handleConnectPrinter}
                        title={printerConnected ? 'Printer Connected (click to reconnect)' : 'Click to connect printer'}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: printerConnected
                                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))'
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                            color: printerConnected ? '#10b981' : '#ef4444',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: printerConnected ? '#10b981' : '#ef4444',
                            boxShadow: printerConnected ? '0 0 10px #10b981' : '0 0 10px #ef4444'
                        }}></span>
                        {printerConnected ? '🖨️ Ready' : '🖨️ Offline'}
                    </button>
                    <button onClick={() => setSoundEnabled(!soundEnabled)} style={{
                        padding: '0.6rem 1rem', borderRadius: '12px', border: 'none',
                        background: soundEnabled
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))'
                            : 'rgba(255,255,255,0.05)',
                        color: soundEnabled ? '#10b981' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
                    }}>
                        {soundEnabled ? '🔔 ON' : '🔕 OFF'}
                    </button>
                    <button onClick={() => setAutoPrint(!autoPrint)} style={{
                        padding: '0.6rem 1rem', borderRadius: '12px', border: 'none',
                        background: autoPrint
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))'
                            : 'rgba(255,255,255,0.05)',
                        color: autoPrint ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
                    }}>
                        {autoPrint ? '🖨️ Auto' : '🖨️ Off'}
                    </button>
                    <button onClick={playNotificationSound} style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.7)'
                    }}>
                        🔊 Test
                    </button>
                </div>
            </div>

            {/* Daily Report Widget */}
            <DailyPerformanceWidget orders={orders} />

            {/* Status Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.03)',
                padding: '0.75rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)'
            }}>
                {(['ALL', 'PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED'] as const).map(status => {
                    const count = statusCounts[status];
                    const isActive = filterStatus === status;
                    const gradients: Record<string, string> = {
                        'ALL': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        'PENDING': 'linear-gradient(135deg, #f59e0b, #d97706)',
                        'PREPARING': 'linear-gradient(135deg, #f97316, #ea580c)',
                        'DELIVERING': 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        'COMPLETED': 'linear-gradient(135deg, #10b981, #059669)',
                        'CANCELLED': 'linear-gradient(135deg, #ef4444, #dc2626)'
                    };
                    return (
                        <button key={status} onClick={() => setFilterStatus(status)} style={{
                            padding: '0.6rem 1rem', borderRadius: '10px', border: 'none',
                            background: isActive ? gradients[status] : 'rgba(255,255,255,0.05)',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                            cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}>
                            {status} ({count})
                        </button>
                    );
                })}            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '3rem 2rem',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                    <h3 style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>No orders in this category</h3>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredOrders.map(order => {
                        const address = parseAddress(order.addressJson);
                        const isNew = newOrderIds.has(order.id);
                        const remaining = getRemainingTime(order);
                        const statusStyle = getStatusStyle(order.status);
                        const isSettingThis = settingEstimate === order.id;
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div key={order.id} style={{
                                background: isNew
                                    ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))'
                                    : 'rgba(255,255,255,0.03)',
                                border: isNew
                                    ? '2px solid rgba(245,158,11,0.5)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: isNew ? '0 4px 20px rgba(245,158,11,0.2)' : 'none',
                                transition: 'all 0.2s ease'
                            }}>
                                <div onClick={() => setExpandedOrder(isExpanded ? null : order.id)} style={{
                                    padding: '1rem 1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    flexWrap: 'wrap',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ minWidth: '140px' }}>
                                        <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                            #{order.id.slice(0, 8)}
                                            {isNew && <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>🆕</span>}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div style={{ minWidth: '150px', flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>👤 {address.name || 'Guest'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                            {order.deliveryMethod === 'DELIVERY' ? '🛵' : order.deliveryMethod === 'PICKUP' ? '🏃' : '🍽️'} {order.deliveryMethod}
                                        </div>

                                        {/* Scheduled Order Badge */}
                                        {order.isScheduled && order.requestedTime && (() => {
                                            const diff = new Date(order.requestedTime).getTime() - Date.now();
                                            const minutesLeft = diff / 1000 / 60;

                                            let bg = '#e0f2fe'; // Default Blue
                                            let border = '#38bdf8';
                                            let color = '#0369a1';
                                            let animation = 'none';
                                            let label = '';

                                            if (minutesLeft < 30) {
                                                // Critical (< 30m)
                                                bg = '#fee2e2'; // Red
                                                border = '#ef4444';
                                                color = '#b91c1c';
                                                animation = 'pulse 1.5s infinite';
                                                label = ' (CRITICAL)';
                                            } else if (minutesLeft < 60) {
                                                // Warning (< 1h)
                                                bg = '#ffedd5'; // Orange
                                                border = '#f97316';
                                                color = '#c2410c';
                                                label = ' (1h)';
                                            } else if (minutesLeft < 120) {
                                                // Notice (< 2h)
                                                bg = '#fef9c3'; // Yellow
                                                border = '#eab308';
                                                color = '#854d0e';
                                                label = ' (2h)';
                                            }

                                            return (
                                                <div style={{
                                                    marginTop: '0.25rem',
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: bg,
                                                    border: `1px solid ${border}`,
                                                    color: color,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    animation: animation
                                                }}>
                                                    📅 Due: {new Date(order.requestedTime).toLocaleString('sv-SE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    {label}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div style={{ minWidth: '100px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                    </div>

                                    {/* Time Badge - like customer dashboard - BUT HIDE IF COMPLETED */}
                                    {remaining !== null && remaining > 0 && order.status !== 'COMPLETED' && (
                                        <div style={{
                                            padding: '0.3rem 0.6rem',
                                            background: remaining <= 5 ? '#dc2626' : '#059669',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            color: '#fff'
                                        }}>
                                            ⏱ {remaining} min
                                        </div>
                                    )}
                                    {order.status === 'COMPLETED' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '50px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                background: '#dcfce7',
                                                color: '#166534',
                                                border: '1px solid #bbf7d0',
                                            }}>
                                                ✅ COMPLETED
                                            </span>
                                            {/* Punctuality Badge */}
                                            {(() => {
                                                if (!order.completedAt) return null;

                                                // If Scheduled: Target is requestedTime
                                                // If ASAP: Target is createdAt + estimatedMinutes (or standard 45m if missing)
                                                let targetTime = 0;
                                                let isScheduled = order.isScheduled && order.requestedTime;

                                                if (isScheduled && order.requestedTime) {
                                                    targetTime = new Date(order.requestedTime).getTime();
                                                } else {
                                                    // For ASAP, assume target is creation + estimate (or 45 mins default)
                                                    const estimateMins = order.estimatedMinutes || 45;
                                                    targetTime = new Date(order.createdAt).getTime() + (estimateMins * 60 * 1000);
                                                }

                                                const completedTime = new Date(order.completedAt).getTime();
                                                const diffMinutes = Math.round((completedTime - targetTime) / 1000 / 60);

                                                // Logic:
                                                // diff < 0: Early (Good)
                                                // diff > 0: Late (Bad)

                                                // Tolerance: +/- 5 mins is "On Time"
                                                let badgeColor = '#166534'; // Green
                                                let badgeBg = '#dcfce7';
                                                let text = '';

                                                if (Math.abs(diffMinutes) <= 5) {
                                                    text = '⏱️ On Time';
                                                    badgeBg = '#dcfce7'; badgeColor = '#166534';
                                                } else if (diffMinutes < -5) {
                                                    text = `⚡ ${Math.abs(diffMinutes)}m Early`;
                                                    badgeBg = '#d1fae5'; badgeColor = '#047857';
                                                } else if (diffMinutes > 5 && diffMinutes <= 15) {
                                                    text = `⚠️ ${diffMinutes}m Delay`;
                                                    badgeBg = '#fef9c3'; badgeColor = '#854d0e';
                                                } else {
                                                    text = `🛑 ${diffMinutes}m Late`;
                                                    badgeBg = '#fee2e2'; badgeColor = '#991b1b';
                                                }

                                                return (
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        color: badgeColor,
                                                        background: badgeBg,
                                                        padding: '2px 6px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {text}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    ) : (<div style={{
                                        padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                        background: statusStyle.bg, color: statusStyle.color,
                                        display: 'flex', alignItems: 'center', gap: '0.35rem'
                                    }}>
                                        {statusStyle.icon} {order.status}
                                    </div>
                                    )}

                                    <div style={{
                                        minWidth: '80px',
                                        textAlign: 'right',
                                        fontWeight: '800',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {Number(order.total)} {currencySymbol}
                                    </div>

                                    <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>
                                        {isExpanded ? '▲' : '▼'}
                                    </div>
                                </div>

                                {/* Time & Status Section - Always visible for active orders */}
                                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                    <div style={{
                                        padding: '0.75rem 1.25rem',
                                        borderTop: '1px solid rgba(255,255,255,0.08)',
                                        background: order.estimatedMinutes
                                            ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))'
                                            : (isNew ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))' : 'rgba(255,255,255,0.02)'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        <select
                                            value={order.status}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            style={{
                                                padding: '0.4rem 0.6rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: 'rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="PENDING" style={{ color: '#000' }}>PENDING</option>
                                            <option value="PAID" style={{ color: '#000' }}>PAID</option>
                                            <option value="PREPARING" style={{ color: '#000' }}>PREPARING</option>
                                            <option value="DELIVERING" style={{ color: '#000' }}>DELIVERING</option>
                                            <option value="COMPLETED" style={{ color: '#000' }}>COMPLETED</option>
                                            <option value="CANCELLED" style={{ color: '#000' }}>CANCELLED</option>
                                        </select>

                                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

                                        {order.estimatedMinutes ? (
                                            <>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#059669' }}>
                                                    ✅ Set: {order.estimatedMinutes}m
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Change:</span>
                                                {TIME_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={(e) => { e.stopPropagation(); setEstimatedTime(order.id, opt.value); }}
                                                        disabled={isSettingThis}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            border: order.estimatedMinutes === opt.value ? '2px solid #059669' : '1px solid #d1d5db',
                                                            borderRadius: '4px',
                                                            background: order.estimatedMinutes === opt.value ? '#d1fae5' : '#fff',
                                                            cursor: isSettingThis ? 'wait' : 'pointer',
                                                            fontSize: '0.7rem',
                                                            fontWeight: order.estimatedMinutes === opt.value ? '700' : '500',
                                                            color: order.estimatedMinutes === opt.value ? '#059669' : '#6b7280'
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#92400e' }}>⏱️ Set Time:</span>
                                                {TIME_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={(e) => { e.stopPropagation(); setEstimatedTime(order.id, opt.value); }}
                                                        disabled={isSettingThis}
                                                        style={{
                                                            padding: '0.4rem 0.75rem',
                                                            border: '1px solid #fbbf24',
                                                            borderRadius: '6px',
                                                            background: '#fff',
                                                            cursor: isSettingThis ? 'wait' : 'pointer',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            opacity: isSettingThis ? 0.6 : 1,
                                                            color: '#92400e'
                                                        }}
                                                    >
                                                        {opt.icon} {opt.label}
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{
                                        borderTop: '1px solid rgba(255,255,255,0.08)',
                                        padding: '1rem 1.25rem',
                                        background: 'rgba(255,255,255,0.02)'
                                    }}>
                                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#fff' }}>📋 Items</div>
                                                {order.items.map((item: any) => (
                                                    <div key={item.id} style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>{item.quantity}x {item.product?.translations?.[0]?.name || item.combo?.translations?.[0]?.name || 'Item'}</span>
                                                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{Number(item.price)} {currencySymbol}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {address.phone && (
                                                <div style={{ minWidth: '150px' }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#fff' }}>📞 Contact</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{address.phone}</div>
                                                    {address.street && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>{address.street}</div>}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                    color: '#fff',
                                                    borderRadius: '10px',
                                                    textDecoration: 'none',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                👁️ View
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); printOrder(order); }}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(99, 102, 241, 0.15)',
                                                    color: '#a5b4fc',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                🖨️ Print
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    color: '#f87171',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>

                                            {/* WhatsApp Notification Button */}
                                            {address.phone && (
                                                <a
                                                    href={`https://wa.me/${address.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                                        `Hello ${address.name || 'Customer'},\n\nUpdate on your order #${order.id.slice(0, 8)}:\nStatus: ${order.status}\n\nThank you for choosing us!`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        padding: '0.4rem 0.6rem',
                                                        background: '#25D366',
                                                        color: '#fff',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        textDecoration: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    💬 WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
