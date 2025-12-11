'use client';

import { useState, useEffect } from 'react';
import { VAT_PRESETS } from '@/lib/vat';

interface VATSettings {
    vatEnabled: boolean;
    vatNumber: string;
    vatRateStandard: number;
    vatRateReduced: number;
    vatPriceInclusive: boolean;
}

export default function VATSettingsSection() {
    const [settings, setSettings] = useState<VATSettings>({
        vatEnabled: true,
        vatNumber: '',
        vatRateStandard: 0.19,
        vatRateReduced: 0.07,
        vatPriceInclusive: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load settings from API
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        vatEnabled: data.vatEnabled ?? true,
                        vatNumber: data.vatNumber ?? '',
                        vatRateStandard: data.vatRateStandard ?? 0.19,
                        vatRateReduced: data.vatRateReduced ?? 0.07,
                        vatPriceInclusive: data.vatPriceInclusive ?? true,
                    });
                }
            } catch (e) {
                console.error('Error loading VAT settings:', e);
            }
            setLoading(false);
        };
        loadSettings();
    }, []);

    // Save settings
    const saveSettings = async (newSettings: VATSettings) => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (e) {
            console.error('Error saving VAT settings:', e);
        }
        setSaving(false);
    };

    const handleChange = (key: keyof VATSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        saveSettings(newSettings);
    };

    const applyPreset = (countryCode: keyof typeof VAT_PRESETS) => {
        const preset = VAT_PRESETS[countryCode];
        const newSettings = {
            ...settings,
            vatRateStandard: preset.standard,
            vatRateReduced: preset.reduced,
        };
        setSettings(newSettings);
        saveSettings(newSettings);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        marginTop: '0.5rem'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500'
    };

    return (
        <div>
            {saved && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#10b981',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    ✅ VAT settings saved!
                </div>
            )}

            {/* Enable/Disable VAT */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>💰 VAT Enabled</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => handleChange('vatEnabled', true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: settings.vatEnabled ? '#10b981' : 'rgba(255,255,255,0.05)',
                            color: settings.vatEnabled ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        ✓ Enabled
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange('vatEnabled', false)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: !settings.vatEnabled ? '#ef4444' : 'rgba(255,255,255,0.05)',
                            color: !settings.vatEnabled ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        ✗ Disabled
                    </button>
                </div>
            </div>

            {settings.vatEnabled && (
                <>
                    {/* Country Presets */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={labelStyle}>🇪🇺 Country Presets</label>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {Object.entries(VAT_PRESETS).map(([code, preset]) => (
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() => applyPreset(code as keyof typeof VAT_PRESETS)}
                                    style={{
                                        padding: '0.6rem 1rem',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <span>{code === 'DE' ? '🇩🇪' : code === 'SE' ? '🇸🇪' : code === 'AT' ? '🇦🇹' : code === 'NL' ? '🇳🇱' : code === 'FR' ? '🇫🇷' : code === 'IT' ? '🇮🇹' : '🇪🇸'}</span>
                                    <span>{preset.name}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                                        ({(preset.standard * 100).toFixed(0)}%/{(preset.reduced * 100).toFixed(0)}%)
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* VAT Number */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={labelStyle}>🔢 VAT Number (optional)</label>
                        <input
                            type="text"
                            value={settings.vatNumber}
                            onChange={(e) => handleChange('vatNumber', e.target.value)}
                            placeholder="e.g. DE123456789 or SE556012345601"
                            style={inputStyle}
                        />
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                            Will be displayed on receipts if provided
                        </p>
                    </div>

                    {/* VAT Rates */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={labelStyle}>📊 Standard Rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={settings.vatRateStandard}
                                onChange={(e) => handleChange('vatRateStandard', parseFloat(e.target.value) || 0)}
                                style={inputStyle}
                            />
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                                Current: <span style={{ color: '#fff' }}>{(settings.vatRateStandard * 100).toFixed(0)}%</span>
                            </p>
                        </div>
                        <div>
                            <label style={labelStyle}>🍕 Reduced Rate (Food) (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={settings.vatRateReduced}
                                onChange={(e) => handleChange('vatRateReduced', parseFloat(e.target.value) || 0)}
                                style={inputStyle}
                            />
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                                Current: <span style={{ color: '#fff' }}>{(settings.vatRateReduced * 100).toFixed(0)}%</span> (used for food orders)
                            </p>
                        </div>
                    </div>

                    {/* Price Inclusive Toggle */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={labelStyle}>💵 Prices Include VAT</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => handleChange('vatPriceInclusive', true)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: settings.vatPriceInclusive ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                    color: settings.vatPriceInclusive ? 'white' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                ✓ Yes (EU Standard)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleChange('vatPriceInclusive', false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: !settings.vatPriceInclusive ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                    color: !settings.vatPriceInclusive ? 'white' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                ✗ No (Add VAT at checkout)
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Current VAT Summary */}
            <div style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#fff', fontWeight: 'bold' }}>
                    📋 Current VAT Configuration
                </h4>
                <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', display: 'grid', gap: '0.5rem' }}>
                    {settings.vatEnabled ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                <span>VAT Status</span>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>Enabled</span>
                            </div>
                            {settings.vatNumber && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                    <span>VAT Number</span>
                                    <span style={{ color: '#fff' }}>{settings.vatNumber}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                <span>Standard Rate</span>
                                <span style={{ color: '#fff' }}>{(settings.vatRateStandard * 100).toFixed(0)}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                <span>Reduced Rate (Food)</span>
                                <span style={{ color: '#fff' }}>{(settings.vatRateReduced * 100).toFixed(0)}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Price Display</span>
                                <span style={{ color: '#fff' }}>{settings.vatPriceInclusive ? 'Inclusive (Gross)' : 'Exclusive (Net)'}</span>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>VAT Status</span>
                            <span style={{ color: '#f87171', fontWeight: 'bold' }}>Disabled</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
