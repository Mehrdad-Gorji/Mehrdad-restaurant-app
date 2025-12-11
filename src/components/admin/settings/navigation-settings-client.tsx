'use client';

import { useState, useEffect } from 'react';
import NavLinksEditor from '@/components/admin/settings/nav-links-editor';

interface NavigationSettingsClientProps {
    availablePages: { path: string; description: string }[];
}

export default function NavigationSettingsClient({ availablePages }: NavigationSettingsClientProps) {
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

    if (loading) return <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>Loading settings...</div>;

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
                    }}>🔗 Header Navigation</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Manage the navigation links in the header menu.</p>
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
                <section style={{
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
                    }}>📑 Menu Links</h2>
                    <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                        Configure the links that appear in the main navigation bar. You can add, remove, and reorder links, and provide translations for each language.
                    </p>

                    <NavLinksEditor
                        value={settings.headerNavLinks}
                        onChange={(val: string) => setSettings({ ...settings, headerNavLinks: val })}
                        availablePages={availablePages}
                    />
                </section>
            </form>
        </div>
    );
}
