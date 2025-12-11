'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/image-upload';

// Internal Dark Theme Color Input Component
function DarkColorInput({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative', width: '60px', height: '42px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <input
                        type="color"
                        name={name}
                        value={value || '#000000'}
                        onChange={onChange}
                        style={{
                            position: 'absolute',
                            top: '-50%', left: '-50%',
                            width: '200%', height: '200%',
                            cursor: 'pointer',
                            border: 'none',
                            padding: 0,
                            margin: 0
                        }}
                    />
                </div>
                <input
                    type="text"
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    style={{
                        flex: 1,
                        padding: '0.6rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none',
                        fontFamily: 'monospace'
                    }}
                />
            </div>
        </div>
    );
}

export default function GeneralSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({});

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let value: string | number = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
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
            } else {
                alert('Failed to save settings.');
            }
        } catch (error) {
            console.error(error);
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
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500'
    };

    if (loading) return <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>Loading settings...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>

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
                    }}>⚙️ General Settings</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Configure global appearance and content</p>
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* 1. Global Colors */}
                <section style={sectionStyle}>
                    <h2 style={headerStyle}>
                        <span style={{ fontSize: '1.5rem' }}>🎨</span> Global Brand Colors
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        <DarkColorInput label="Primary Color" name="primaryColor" value={settings.primaryColor} onChange={handleChange} />
                        <DarkColorInput label="Secondary Color" name="secondaryColor" value={settings.secondaryColor} onChange={handleChange} />
                        <DarkColorInput label="Background Color" name="backgroundColor" value={settings.backgroundColor} onChange={handleChange} />
                    </div>
                </section>

                {/* 2. Typography */}
                <section style={sectionStyle}>
                    <h2 style={headerStyle}>
                        <span style={{ fontSize: '1.5rem' }}>✍️</span> Typography
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        <DarkColorInput label="Main Text Color" name="textColor" value={settings.textColor} onChange={handleChange} />
                        <DarkColorInput label="Muted/Secondary Text" name="textMuted" value={settings.textMuted} onChange={handleChange} />
                    </div>
                </section>

                {/* 3. Surfaces & Borders */}
                <section style={sectionStyle}>
                    <h2 style={headerStyle}>
                        <span style={{ fontSize: '1.5rem' }}>🔲</span> Surfaces & Borders
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        <DarkColorInput label="Card/Surface Color" name="surfaceColor" value={settings.surfaceColor} onChange={handleChange} />
                        <DarkColorInput label="Alt Surface Color" name="surfaceAltColor" value={settings.surfaceAltColor} onChange={handleChange} />
                        <DarkColorInput label="Border Color" name="borderColor" value={settings.borderColor} onChange={handleChange} />
                    </div>
                </section>

                {/* 4. UI Shapes & Effects */}
                <section style={sectionStyle}>
                    <h2 style={headerStyle}>
                        <span style={{ fontSize: '1.5rem' }}>✨</span> UI Shapes & Effects
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Card Radius</label>
                            <input type="text" name="borderRadius" value={settings.borderRadius || '20px'} onChange={handleChange} style={inputStyle} />
                            <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.4rem', display: 'block' }}>e.g. 10px, 20px, 50%</small>
                        </div>
                        <div>
                            <label style={labelStyle}>Button Radius</label>
                            <input type="text" name="btnRadius" value={settings.btnRadius || '50px'} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Glass Opacity ({settings.glassOpacity})</label>
                            <input
                                type="range"
                                name="glassOpacity"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings.glassOpacity || 0.75}
                                onChange={handleChange}
                                style={{ width: '100%', accentColor: '#6366f1', marginTop: '0.5rem' }}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Glass Blur</label>
                            <input type="text" name="glassBlur" value={settings.glassBlur || '16px'} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                </section>

                {/* 5. Homepage Content */}
                <section style={sectionStyle}>
                    <h2 style={headerStyle}>
                        <span style={{ fontSize: '1.5rem' }}>🏠</span> Homepage Content
                    </h2>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Brand Name (Text)</label>
                        <input type="text" name="brandName" value={settings.brandName || ''} onChange={handleChange} style={inputStyle} placeholder="My Awesome Shop" />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Brand Logo (Replaces Text if set)</label>
                        <ImageUpload
                            value={settings.logo || ''}
                            onChange={(url) => setSettings({ ...settings, logo: url })}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Hero Title</label>
                        <input type="text" name="heroTitle" value={settings.heroTitle || ''} onChange={handleChange} style={inputStyle} placeholder="Best Pizza in Town" />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Hero Title Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative', width: '60px', height: '42px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <input
                                    type="color"
                                    name="heroTitleColor"
                                    value={settings.heroTitleColor || '#FFFFFF'}
                                    onChange={handleChange}
                                    style={{
                                        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', cursor: 'pointer', padding: 0, margin: 0
                                    }}
                                />
                            </div>
                            <input
                                type="text"
                                name="heroTitleColor"
                                value={settings.heroTitleColor || ''}
                                onChange={handleChange}
                                style={{ ...inputStyle, width: '120px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Hero Description</label>
                        <input type="text" name="heroDescription" value={settings.heroDescription || ''} onChange={handleChange} style={inputStyle} placeholder="Order fresh and hot..." />
                    </div>

                    <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ ...labelStyle, color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Hero Background Image</label>
                        <ImageUpload
                            value={settings.heroImage}
                            onChange={(url) => setSettings({ ...settings, heroImage: url })}
                        />
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>💡</span> Upload a high-quality dark image for best results.
                        </p>
                    </div>
                </section>
            </form>
        </div>
    );
}
