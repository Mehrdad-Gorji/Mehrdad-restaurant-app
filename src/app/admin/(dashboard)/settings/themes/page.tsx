'use client';

import { useState, useEffect } from 'react';
import SpecialOccasionWidget from '@/components/themes/special-occasion-widget';
import ResponsiveGrid from '@/components/admin/responsive-grid';
import ImageUpload from '@/components/admin/image-upload';

const THEMES = [
    'NONE',
    'CUSTOM',
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

    // Custom Theme State
    const [customImage, setCustomImage] = useState('');
    const [customColor, setCustomColor] = useState('#3b82f6');
    const [customOpacity, setCustomOpacity] = useState(100);
    const [customIcon, setCustomIcon] = useState('🎨');

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

                    const cImage = data.find((s: any) => s.key === 'theme_custom_image');
                    const cColor = data.find((s: any) => s.key === 'theme_custom_color');
                    const cOpacity = data.find((s: any) => s.key === 'theme_custom_opacity');
                    const cIcon = data.find((s: any) => s.key === 'theme_custom_icon');

                    if (theme) setActiveTheme(theme.value);
                    if (title) setCustomTitle(title.value);
                    if (subtitle) setCustomSubtitle(subtitle.value);
                    if (btn) setCustomButtonText(btn.value);
                    if (badge) setCustomBadge(badge.value);

                    if (cImage) setCustomImage(cImage.value);
                    if (cColor) setCustomColor(cColor.value);
                    if (cOpacity) setCustomOpacity(parseInt(cOpacity.value) || 100);
                    if (cIcon) setCustomIcon(cIcon.value);
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
            // Save all settings concurrently
            await Promise.all([
                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'active_theme', value: activeTheme }) }),
                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'theme_custom_title', value: customTitle }) }),
                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'theme_custom_subtitle', value: customSubtitle }) }),
                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'theme_custom_button', value: customButtonText }) }),
                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'theme_custom_badge', value: customBadge }) }),

                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'theme_custom_image', value: customImage }) }),
                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'theme_custom_color', value: customColor }) }),
                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'theme_custom_opacity', value: customOpacity.toString() }) }),
                fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'theme_custom_icon', value: customIcon }) }),
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

    const sectionStyle = {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)'
    };

    const sectionHeaderStyle = {
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

            <div style={sectionStyle}>
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
                    Select "CUSTOM" to design your own.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.25rem'
                }}>
                    {THEMES.map(theme => {
                        const isActive = activeTheme === theme;

                        // Theme-specific configurations
                        const themeConfig: Record<string, { icon: string; gradient: string; backgroundImage?: string; emoji: string; description: string }> = {
                            'NONE': {
                                icon: '⚪',
                                gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                                emoji: '🌐',
                                description: 'Default look'
                            },
                            'CUSTOM': {
                                icon: customIcon || '🎨',
                                gradient: `linear-gradient(135deg, ${customColor} 0%, #1f2937 100%)`,
                                backgroundImage: customImage,
                                emoji: '✨',
                                description: 'Your custom design'
                            },
                            'BLACK_FRIDAY': {
                                icon: '🏷️',
                                gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333333 50%, #000000 100%)',
                                backgroundImage: '/images/themes/black-friday.png',
                                emoji: '🛍️',
                                description: 'Mega discounts'
                            },
                            'CHRISTMAS': {
                                icon: '🎄',
                                gradient: 'linear-gradient(135deg, #165B33 0%, #BB2528 50%, #165B33 100%)',
                                backgroundImage: '/images/themes/christmas.png',
                                emoji: '🎅',
                                description: 'Holiday magic'
                            },
                            'NEW_YEAR': {
                                icon: '🎆',
                                gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                                backgroundImage: '/images/themes/new-year.png',
                                emoji: '🥂',
                                description: 'Fresh start'
                            },
                            'VALENTINE': {
                                icon: '💕',
                                gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 50%, #c94c4c 100%)',
                                backgroundImage: '/images/themes/valentine.png',
                                emoji: '💝',
                                description: 'Love is in the air'
                            },
                            'EASTER': {
                                icon: '🐰',
                                gradient: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3b6 100%)',
                                backgroundImage: '/images/themes/easter.png',
                                emoji: '🥚',
                                description: 'Spring celebration'
                            },
                            'HALLOWEEN': {
                                icon: '🎃',
                                gradient: 'linear-gradient(135deg, #ff6600 0%, #1a1a1a 50%, #ff6600 100%)',
                                backgroundImage: '/images/themes/halloween.png',
                                emoji: '👻',
                                description: 'Spooky vibes'
                            },
                            'SUMMER': {
                                icon: '☀️',
                                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ff9a9e 100%)',
                                backgroundImage: '/images/themes/summer.png',
                                emoji: '🏖️',
                                description: 'Hot deals'
                            },
                            'EID': {
                                icon: '🌙',
                                gradient: 'linear-gradient(135deg, #1d4e5f 0%, #2d6a4f 50%, #40916c 100%)',
                                backgroundImage: '/images/themes/eid.png',
                                emoji: '✨',
                                description: 'Blessed celebration'
                            }
                        };

                        const config = themeConfig[theme] || themeConfig['NONE'];
                        const isEaster = theme === 'EASTER';

                        return (
                            <div
                                key={theme}
                                onClick={() => setActiveTheme(theme)}
                                style={{
                                    position: 'relative',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: isActive
                                        ? '0 20px 40px rgba(99, 102, 241, 0.4), 0 0 0 3px #8B5CF6'
                                        : '0 4px 15px rgba(0,0,0,0.2)',
                                    background: '#1a1a1a'
                                }}
                            >
                                {/* Background Image Layer (if available) */}
                                {config.backgroundImage && (
                                    <>
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundImage: `url(${config.backgroundImage})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            opacity: 0.4
                                        }} />
                                        {/* Dark overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)'
                                        }} />
                                    </>
                                )}

                                {/* Gradient Background */}
                                <div style={{
                                    background: config.backgroundImage ? 'transparent' : config.gradient,
                                    padding: '24px 20px',
                                    minHeight: '160px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative'
                                }}>
                                    {/* Decorative Elements */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        right: '-20px',
                                        fontSize: '80px',
                                        opacity: 0.15,
                                        transform: 'rotate(15deg)'
                                    }}>
                                        {config.emoji}
                                    </div>

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            width: '28px',
                                            height: '28px',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.5)',
                                            fontSize: '14px',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            ✓
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div style={{
                                        fontSize: '40px',
                                        marginBottom: '12px',
                                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                    }}>
                                        {config.icon}
                                    </div>

                                    {/* Text Content */}
                                    <div>
                                        <div style={{
                                            fontWeight: '700',
                                            fontSize: '1.1rem',
                                            color: isEaster ? '#1a1a1a' : '#fff',
                                            marginBottom: '4px',
                                            textShadow: isEaster ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {theme.replace('_', ' ')}
                                        </div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: isEaster ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                                            fontWeight: '400'
                                        }}>
                                            {config.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Bar */}
                                <div style={{
                                    background: isActive
                                        ? 'linear-gradient(135deg, #8B5CF6, #6366F1)'
                                        : 'rgba(0,0,0,0.4)',
                                    padding: '10px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s'
                                }}>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        color: 'white',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {isActive ? '✓ Active' : 'Select'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Custom Design Section (Only visible for CUSTOM theme) */}
            {activeTheme === 'CUSTOM' && (
                <div style={{ ...sectionStyle, marginTop: '2rem' }}>
                    <h2 style={sectionHeaderStyle}>🛠️ Design Your Theme</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Background Image</label>
                            <div style={{ marginTop: '0.5rem' }}>
                                <ImageUpload
                                    value={customImage}
                                    onChange={(url) => setCustomImage(url)}
                                // Make sure it doesn't break if props differ slightly, using standard props
                                />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                                Recommend 1920x600px or larger.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Accent Color</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={customColor}
                                        onChange={e => setCustomColor(e.target.value)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: 'none'
                                        }}
                                    />
                                    <input
                                        value={customColor}
                                        onChange={e => setCustomColor(e.target.value)}
                                        style={{ ...inputStyle, marginTop: 0 }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Accent Opacity: {customOpacity}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={customOpacity}
                                    onChange={e => setCustomOpacity(Number(e.target.value))}
                                    style={{ width: '100%', marginTop: '0.5rem', accentColor: customColor }}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Theme Icon (Emoji)</label>
                                <input
                                    value={customIcon}
                                    onChange={e => setCustomIcon(e.target.value)}
                                    placeholder="e.g. 🚀"
                                    style={inputStyle}
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Section */}
            {activeTheme !== 'NONE' && (
                <ResponsiveGrid columns="1-1" gap="2rem" style={{ marginTop: '2rem' }}>

                    {/* CUSTOM TEXT SECTION */}
                    <div style={sectionStyle}>
                        <h2 style={sectionHeaderStyle}>✍️ Custom Text</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Badge Text (Top Label)</label>
                                <input
                                    value={customBadge}
                                    onChange={e => setCustomBadge(e.target.value)}
                                    placeholder="e.g. SPECIAL OFFER"
                                    style={inputStyle}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Banner Title</label>
                                <input
                                    value={customTitle}
                                    onChange={e => setCustomTitle(e.target.value)}
                                    placeholder="e.g. Merry Christmas"
                                    style={inputStyle}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Subtitle / Message</label>
                                <input
                                    value={customSubtitle}
                                    onChange={e => setCustomSubtitle(e.target.value)}
                                    placeholder="e.g. Celebrate the magic of the season"
                                    style={inputStyle}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Button Label</label>
                                <input
                                    value={customButtonText}
                                    onChange={e => setCustomButtonText(e.target.value)}
                                    placeholder="e.g. View Holiday Menu"
                                    style={inputStyle}
                                    disabled={loading}
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
                                    // Custom Theme Props
                                    customImage={customImage}
                                    customColor={customColor}
                                    customOpacity={customOpacity}
                                    customIcon={customIcon}
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
