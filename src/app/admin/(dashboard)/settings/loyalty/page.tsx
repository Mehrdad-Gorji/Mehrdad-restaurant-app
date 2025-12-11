'use client';

import { useState, useEffect } from 'react';

export default function LoyaltySettingsPage() {
    const [earnRate, setEarnRate] = useState('10'); // Points per 100 currency
    const [redeemRate, setRedeemRate] = useState('10'); // Currency value per 100 points
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const earn = data.find((s: any) => s.key === 'loyalty_earn_rate');
                    const redeem = data.find((s: any) => s.key === 'loyalty_redemption_rate');

                    if (earn) setEarnRate(earn.value);
                    if (redeem) setRedeemRate(redeem.value);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'loyalty_earn_rate', value: earnRate })
                }),
                fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'loyalty_redemption_rate', value: redeemRate })
                })
            ]);

            // Show floating success toast simulation
            const toast = document.createElement('div');
            toast.textContent = 'Settings saved successfully!';
            Object.assign(toast.style, {
                position: 'fixed', bottom: '20px', right: '20px',
                background: '#10b981', color: 'white', padding: '1rem 2rem',
                borderRadius: '8px', zIndex: 9999, transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            });
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);

        } catch (error) {
            console.error(error);
            alert('Error updating settings.');
        } finally {
            setSaving(false);
        }
    };

    const sectionStyle = {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)'
    };

    const headerStyle = {
        marginTop: 0,
        marginBottom: '1.5rem',
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '1rem'
    };

    const inputStyle = {
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: '#fff',
        fontSize: '1.1rem',
        fontWeight: '600',
        width: '120px',
        textAlign: 'center' as const,
        outline: 'none',
        transition: 'all 0.2s'
    };

    if (loading) return <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>Loading settings...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{
                        marginTop: 0,
                        marginBottom: '0.5rem',
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>💎 Loyalty Program</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Configure points earning and redemption rules.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                        opacity: saving ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>{saving ? '💾 Saving...' : '💾 Save Changes'}</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <section style={sectionStyle}>
                    <h2 style={headerStyle}>
                        <span style={{ fontSize: '1.5rem' }}>💰</span> Points Earning
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.95rem', minHeight: '3rem' }}>
                        Configure how many points customers earn when they spend money.
                    </p>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: '#a5b4fc', fontSize: '0.9rem' }}>
                            POINTS PER 100 SEK SPENT
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="number"
                                value={earnRate}
                                onChange={e => setEarnRate(e.target.value)}
                                style={inputStyle}
                            />
                            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Points</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                            Example: If set to <strong style={{ color: '#fff' }}>10</strong>, spending 200 SEK earns <strong style={{ color: '#fff' }}>20</strong> points.
                        </p>
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={headerStyle}>
                        <span style={{ fontSize: '1.5rem' }}>🎁</span> Points Redemption
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.95rem', minHeight: '3rem' }}>
                        Configure the value of points when customers redeem them for coupons.
                    </p>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: '#a5b4fc', fontSize: '0.9rem' }}>
                            VALUE (SEK) PER 100 POINTS
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="number"
                                value={redeemRate}
                                onChange={e => setRedeemRate(e.target.value)}
                                style={inputStyle}
                            />
                            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>SEK Value</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                            Example: If set to <strong style={{ color: '#fff' }}>10</strong>, redeeming 200 points gives a <strong style={{ color: '#fff' }}>20 SEK</strong> coupon.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
