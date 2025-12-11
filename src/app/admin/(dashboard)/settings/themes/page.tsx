'use client';

import { useState, useEffect } from 'react';
import SpecialOccasionWidget from '@/components/themes/special-occasion-widget';
import ResponsiveGrid from '@/components/admin/responsive-grid';

const THEMES = [
    'NONE',
    'BLACK_FRIDAY',
    'CHRISTMAS',
    'NEW_YEAR',
    'VALENTINE',
    'EASTER',
    'HALLOWEEN',
    'SUMMER',
    'EID'
];

export default function ThemeSettingsPage() {
    const [activeTheme, setActiveTheme] = useState('NONE');
    const [customTitle, setCustomTitle] = useState('');
    const [customSubtitle, setCustomSubtitle] = useState('');
    const [customButtonText, setCustomButtonText] = useState('');
    const [customBadge, setCustomBadge] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch all settings
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const theme = data.find((s: any) => s.key === 'active_theme');
                    const title = data.find((s: any) => s.key === 'theme_custom_title');
                    const subtitle = data.find((s: any) => s.key === 'theme_custom_subtitle');
                    const btn = data.find((s: any) => s.key === 'theme_custom_button');
                    const badge = data.find((s: any) => s.key === 'theme_custom_badge');

                    if (theme) setActiveTheme(theme.value);
                    if (title) setCustomTitle(title.value);
                    if (subtitle) setCustomSubtitle(subtitle.value);
                    if (btn) setCustomButtonText(btn.value);
                    if (badge) setCustomBadge(badge.value);
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
            // Save all 4 settings concurrently
            await Promise.all([
                fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'active_theme', value: activeTheme })
                }),
                fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'theme_custom_title', value: customTitle })
                }),
                fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'theme_custom_subtitle', value: customSubtitle })
                }),
                fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'theme_custom_button', value: customButtonText })
                }),
                fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'theme_custom_badge', value: customBadge })
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
            alert('Error updating theme settings.');
        } finally {
            setSaving(false);
        }
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

    if (loading) return <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>Loading themes...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>

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
                    }}>✨ Seasonal Themes</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Manage special occasion banners and visual themes.</p>
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

            <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '24px',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)'
            }}>
                <h2 style={{
                    marginTop: 0,
                    marginBottom: '1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '1rem'
                }}>🎨 Select Active Theme</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    Choose a theme to display a special banner on the Homepage and User Dashboard.
                    Select "NONE" to disable.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {THEMES.map(theme => {
                        const isActive = activeTheme === theme;
                        return (
                            <div
                                key={theme}
                                onClick={() => setActiveTheme(theme)}
                                style={{
                                    border: isActive ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            >
                                <div style={{
                                    fontWeight: 'bold', marginBottom: '0.5rem',
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                                    fontSize: '1rem'
                                }}>
                                    {theme.replace('_', ' ')}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                    {theme === 'NONE' ? 'Standard appearance' : 'Special occasion theme'}
                                </div>
                                {isActive && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        width: '8px', height: '8px', background: '#10b981', borderRadius: '50%',
                                        boxShadow: '0 0 10px #10b981'
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Preview Section */}
            {activeTheme !== 'NONE' && (
                <ResponsiveGrid columns="1-1" gap="2rem" style={{ marginTop: '3rem' }}>

                    {/* CUSTOM TEXT SECTION */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        padding: '2rem',
                        border: '1px solid rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h2 style={{
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
                        }}>✍️ Custom Text</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Badge Text (Top Label)</label>
                                <input
                                    value={customBadge}
                                    onChange={e => setCustomBadge(e.target.value)}
                                    placeholder="e.g. SPECIAL OFFER"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Banner Title</label>
                                <input
                                    value={customTitle}
                                    onChange={e => setCustomTitle(e.target.value)}
                                    placeholder="e.g. Merry Christmas"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Subtitle / Message</label>
                                <input
                                    value={customSubtitle}
                                    onChange={e => setCustomSubtitle(e.target.value)}
                                    placeholder="e.g. Celebrate the magic of the season"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Button Label</label>
                                <input
                                    value={customButtonText}
                                    onChange={e => setCustomButtonText(e.target.value)}
                                    placeholder="e.g. View Holiday Menu"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 'bold', marginLeft: '0.5rem' }}>👁️ Live Preview</h3>
                        <div style={{
                            border: '1px dashed rgba(255,255,255,0.1)',
                            padding: '2rem',
                            borderRadius: '16px',
                            background: 'rgba(0,0,0,0.2)',
                            minHeight: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{ width: '100%', maxWidth: '400px' }}>
                                <SpecialOccasionWidget
                                    theme={activeTheme}
                                    lang="en"
                                    customTitle={customTitle}
                                    customSubtitle={customSubtitle}
                                    customButtonText={customButtonText}
                                    customBadge={customBadge}
                                />
                            </div>
                        </div>
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                            This is how the banner will appear on the homepage.
                        </p>
                    </div>
                </ResponsiveGrid>
            )}
        </div>
    );
}
