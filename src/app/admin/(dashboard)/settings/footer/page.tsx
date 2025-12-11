'use client';

import { useState, useEffect } from 'react';

export default function FooterSettingsPage() {
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

        // Auto-extract src from iframe tag if user pastes the whole code into mapEmbedUrl
        if (e.target.name === 'mapEmbedUrl' && typeof value === 'string' && value.includes('<iframe')) {
            const srcMatch = value.match(/src="([^"]+)"/);
            if (srcMatch && srcMatch[1]) {
                value = srcMatch[1];
            }
        }

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
        transition: 'all 0.2s',
        marginTop: '0.5rem'
    };

    const labelStyle = {
        display: 'block',
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
                    }}>📞 Contact & Footer</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Manage contact info, social links, and footer content.</p>
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

                {/* 6. Footer Content */}
                <section style={sectionStyle}>
                    <h2 style={headerStyle}>
                        <span style={{ fontSize: '1.5rem' }}>🦶</span> Footer Content
                    </h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Footer Description (Brand)</label>
                        <textarea
                            name="footerBrandDesc"
                            rows={3}
                            value={settings.footerBrandDesc || ''}
                            onChange={handleChange}
                            style={{ ...inputStyle, fontFamily: 'inherit' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Address</label>
                            <input type="text" name="footerAddress" value={settings.footerAddress || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <input type="text" name="footerPhone" value={settings.footerPhone || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input type="text" name="footerEmail" value={settings.footerEmail || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Opening Hours Text</label>
                            <textarea
                                name="openingHours"
                                rows={5}
                                value={settings.openingHours || ''}
                                onChange={handleChange}
                                style={{ ...inputStyle, fontFamily: 'monospace', whiteSpace: 'pre', fontSize: '0.9rem' }}
                                placeholder="(Mån-Tor-------------------11:00-21:00)&#10;(Fredag--------------------11:00-22:00)&#10;(Lör-----------------------12:00-22:00)&#10;(Sönd----------------------12:00-21:00)"
                            />
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                                Tip: Use dashes/spaces to align times nicely. This text is displayed exactly as typed.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '2.5rem', marginBottom: '1.5rem', fontWeight: 'bold', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>Social Links</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Facebook URL</label>
                            <input type="text" name="socialFacebook" value={settings.socialFacebook || ''} onChange={handleChange} style={inputStyle} placeholder="https://facebook.com/..." />
                        </div>
                        <div>
                            <label style={labelStyle}>Instagram URL</label>
                            <input type="text" name="socialInstagram" value={settings.socialInstagram || ''} onChange={handleChange} style={inputStyle} placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                            <label style={labelStyle}>Twitter / X URL</label>
                            <input type="text" name="socialTwitter" value={settings.socialTwitter || ''} onChange={handleChange} style={inputStyle} placeholder="https://twitter.com/..." />
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '2.5rem', marginBottom: '1.5rem', fontWeight: 'bold', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>📍 Google Maps Embed</h3>
                    <div>
                        <label style={labelStyle}>Map Embed URL</label>
                        <input type="text" name="mapEmbedUrl" value={settings.mapEmbedUrl || ''} onChange={handleChange} style={inputStyle} placeholder="https://www.google.com/maps/embed?pb=..." />
                        <small style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                            Go to Google Maps → Share → Embed a map → Copy the src URL (or paste the whole iframe code here and we'll extract it).
                        </small>
                    </div>
                </section>
            </form>
        </div>
    );
}
