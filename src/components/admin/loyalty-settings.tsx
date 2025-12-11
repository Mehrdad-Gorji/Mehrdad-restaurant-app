
'use client';

import { useState, useEffect } from 'react';

export default function LoyaltySettings() {
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
            alert('Loyalty settings saved!');
        } catch (e) {
            alert('Error saving settings');
        }
        setSaving(false);
    };

    if (loading) return <div>Loading...</div>;

    const renderMilestone = (title: string, prefix: string, color: string) => (
        <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>{title}</h4>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name={`${prefix}Enabled`}
                            checked={settings?.[`${prefix}Enabled`] || false}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span>{settings?.[`${prefix}Enabled`] ? 'Active' : 'Disabled'}</span>
                    </label>
                </div>

                {settings?.[`${prefix}Enabled`] && (
                    <>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Type</label>
                            <select
                                name={`${prefix}Type`}
                                value={settings[`${prefix}Type`] || 'PERCENTAGE'}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', color: '#333' }}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (kr)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Value</label>
                            <input
                                type="number"
                                name={`${prefix}Value`}
                                value={settings[`${prefix}Value`] || 0}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', color: '#333' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Validity (Days)</label>
                            <input
                                type="number"
                                name={`${prefix}Days`}
                                value={settings[`${prefix}Days`] || 30}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', color: '#333' }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            color: 'white',
            marginBottom: '2rem',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.2)'
        }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>💎 Loyalty Rewards Program</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1.5rem' }}>
                Reward customers automatically after their 2nd and 3rd completed orders.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {renderMilestone('🥈 2nd Order Reward', 'loyaltySecondOrder', '#ec4899')}
                {renderMilestone('🥉 3rd Order Reward', 'loyaltyThirdOrder', '#8b5cf6')}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '0.75rem 2rem',
                        background: 'white',
                        color: '#4f46e5',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    {saving ? 'Saving...' : 'Save Loyalty Settings'}
                </button>
            </div>
        </div>
    );
}
