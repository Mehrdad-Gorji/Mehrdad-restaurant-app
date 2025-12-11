
'use client';

import { useState, useEffect } from 'react';

export default function WelcomeCouponSettings() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
        const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setSettings({ ...settings, [e.target.name]: val });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            alert('Settings saved!');
        } catch (e) {
            alert('Error saving settings');
        }
        setSaving(false);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            marginBottom: '2rem',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
        }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>🎁 New Customer Welcome Reward</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1.5rem' }}>
                Automatically create a personal coupon for every new customer who registers.
            </p>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Status</label>
                    <label style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            name="welcomeCouponEnabled"
                            checked={settings?.welcomeCouponEnabled || false}
                            onChange={handleChange}
                            style={{ width: '20px', height: '20px', accentColor: '#fff' }}
                        />
                        <span style={{ fontWeight: 'bold' }}>
                            {settings?.welcomeCouponEnabled ? 'Active' : 'Disabled'}
                        </span>
                    </label>
                </div>

                {settings?.welcomeCouponEnabled && (
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Discount Type</label>
                            <select
                                name="welcomeCouponType"
                                value={settings.welcomeCouponType || 'PERCENTAGE'}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none', color: '#10b981', fontWeight: 'bold' }}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (kr)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Value</label>
                            <input
                                type="number"
                                name="welcomeCouponValue"
                                value={settings.welcomeCouponValue || 10}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none', color: '#10b981', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Validity (Days)</label>
                            <input
                                type="number"
                                name="welcomeCouponDays"
                                value={settings.welcomeCouponDays || 30}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none', color: '#10b981', fontWeight: 'bold' }}
                            />
                        </div>
                    </>
                )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '0.75rem 2rem',
                        background: 'white',
                        color: '#059669',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
