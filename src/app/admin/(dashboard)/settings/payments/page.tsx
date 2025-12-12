'use client';

import { useState, useEffect } from 'react';

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({});
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setSettings({ ...settings, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                const toast = document.createElement('div');
                toast.textContent = '✅ Payment settings saved!';
                Object.assign(toast.style, {
                    position: 'fixed', bottom: '20px', right: '20px',
                    background: '#10b981', color: 'white', padding: '1rem 2rem',
                    borderRadius: '8px', zIndex: 9999
                });
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            } else {
                alert('Failed to save settings.');
            }
        } catch (error) {
            alert('Error saving settings.');
        } finally {
            setSaving(false);
        }
    };

    const sectionStyle = {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '2rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.95rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500'
    };

    if (loading) return <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
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
                    }}>💳 Payment Settings</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)' }}>Configure Swedbank Pay integration</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? '💾 Saving...' : '💾 Save Changes'}
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Swedbank Pay Section */}
                <section style={sectionStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>🏦</span> Swedbank Pay
                        </h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="swedbankPayEnabled"
                                checked={settings.swedbankPayEnabled || false}
                                onChange={handleChange}
                                style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                            />
                            <span style={{ color: settings.swedbankPayEnabled ? '#10b981' : 'rgba(255,255,255,0.5)' }}>
                                {settings.swedbankPayEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Mode</label>
                            <select
                                name="swedbankPayMode"
                                value={settings.swedbankPayMode || 'test'}
                                onChange={handleChange}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                            >
                                <option value="test">🧪 Test Mode</option>
                                <option value="production">🚀 Production</option>
                            </select>
                            <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.4rem', display: 'block' }}>
                                Use Test Mode for development, Production for live payments
                            </small>
                        </div>

                        <div>
                            <label style={labelStyle}>Payee ID (Merchant ID)</label>
                            <input
                                type="text"
                                name="swedbankPayPayeeId"
                                value={settings.swedbankPayPayeeId || ''}
                                onChange={handleChange}
                                placeholder="e.g. 5cabf558-5283-482f-b252-4d58e06f6f3b"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Access Token (Bearer Token)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    name="swedbankPayAccessToken"
                                    value={settings.swedbankPayAccessToken || ''}
                                    onChange={handleChange}
                                    placeholder="Your secret access token..."
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    style={{
                                        padding: '0 1rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showToken ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.4rem', display: 'block' }}>
                                ⚠️ Keep this token secret! Never share it publicly.
                            </small>
                        </div>

                        <div>
                            <label style={labelStyle}>Payee Name (Display Name)</label>
                            <input
                                type="text"
                                name="swedbankPayPayeeName"
                                value={settings.swedbankPayPayeeName || ''}
                                onChange={handleChange}
                                placeholder="e.g. Pizzeria Canaria"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </section>

                {/* Payment Methods */}
                <section style={sectionStyle}>
                    <h2 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>💳</span> Payment Methods
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: settings.swishEnabled ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <input
                                type="checkbox"
                                name="swishEnabled"
                                checked={settings.swishEnabled || false}
                                onChange={handleChange}
                                style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#fff', fontWeight: '600' }}>📱 Swish</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Accept payments via Swish (Sweden)</div>
                            </div>
                        </label>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: settings.cardPaymentEnabled ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <input
                                type="checkbox"
                                name="cardPaymentEnabled"
                                checked={settings.cardPaymentEnabled || false}
                                onChange={handleChange}
                                style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#fff', fontWeight: '600' }}>💳 Card (Visa/Mastercard)</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Accept credit and debit cards</div>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Status */}
                <section style={{
                    ...sectionStyle,
                    background: settings.swedbankPayEnabled && settings.swedbankPayPayeeId && settings.swedbankPayAccessToken
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    border: settings.swedbankPayEnabled && settings.swedbankPayPayeeId && settings.swedbankPayAccessToken
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.25rem', color: '#fff' }}>
                        📊 Connection Status
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: settings.swedbankPayEnabled && settings.swedbankPayPayeeId && settings.swedbankPayAccessToken
                                ? '#10b981'
                                : '#ef4444'
                        }} />
                        <span style={{ color: '#fff' }}>
                            {settings.swedbankPayEnabled && settings.swedbankPayPayeeId && settings.swedbankPayAccessToken
                                ? '✅ Ready to accept payments'
                                : '❌ Not configured - Fill in Payee ID and Access Token above'}
                        </span>
                    </div>
                </section>
            </form>
        </div>
    );
}
