'use client';

import { useState, useEffect } from 'react';

interface NavLink {
    label: string;
    labelSv: string;
    labelDe: string;
    url: string;
}

export default function NavLinksEditor({ value, onChange, availablePages = [] }: { value: string, onChange: (val: string) => void, availablePages?: { path: string, description: string }[] }) {
    const defaultLinks = [
        { label: 'Home', labelSv: 'Hem', labelDe: 'Startseite', url: '/' },
        { label: 'Menu', labelSv: 'Meny', labelDe: 'Menü', url: '/menu' },
        { label: 'Offers', labelSv: 'Erbjudanden', labelDe: 'Angebote', url: '/offers' }
    ];

    const [links, setLinks] = useState<NavLink[]>(defaultLinks);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && value) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setLinks(parsed);
                }
            } catch {
                // Keep default links
            }
            setInitialized(true);
        }
    }, [value, initialized]);

    const updateLinks = (newLinks: NavLink[]) => {
        setLinks(newLinks);
        onChange(JSON.stringify(newLinks));
    };

    const addLink = () => {
        updateLinks([...links, { label: 'New Link', labelSv: 'Ny länk', labelDe: 'Neuer Link', url: '/' }]);
    };

    const removeLink = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index);
        updateLinks(newLinks);
    };

    const updateLink = (index: number, field: keyof NavLink, val: string) => {
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], [field]: val };
        updateLinks(newLinks);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newLinks = [...links];
        [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
        updateLinks(newLinks);
    };

    const moveDown = (index: number) => {
        if (index === links.length - 1) return;
        const newLinks = [...links];
        [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
        updateLinks(newLinks);
    };

    // Available pages passed from server
    const pagesToShow = availablePages.length > 0 ? availablePages : [
        { path: '/', description: 'Home Page' },
        { path: '/menu', description: 'Menu' },
        { path: '/offers', description: 'Sample Offers' }
    ];

    const inputStyle = {
        width: '100%',
        padding: '0.6rem 0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: '#fff',
        fontSize: '0.9rem'
    };

    const labelStyle = {
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.5)',
        display: 'block',
        marginBottom: '0.3rem',
        fontWeight: '500'
    };

    return (
        <div>
            {/* Current Navigation Links */}
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                    Current Navigation Links ({links.length})
                </h4>
                {links.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                        No links configured. Click "Add Navigation Link" to start.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {links.map((link, index) => (
                            <div key={index} style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) minmax(200px, 1fr) minmax(200px, 1.2fr) auto',
                                gap: '1rem',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s',
                            }}>
                                <div>
                                    <label style={labelStyle}>🇬🇧 English Label</label>
                                    <input
                                        type="text"
                                        value={link.label}
                                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>🇸🇪 Swedish Label</label>
                                    <input
                                        type="text"
                                        value={link.labelSv}
                                        onChange={(e) => updateLink(index, 'labelSv', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>🇩🇪 German Label</label>
                                    <input
                                        type="text"
                                        value={link.labelDe}
                                        onChange={(e) => updateLink(index, 'labelDe', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>🔗 URL Path</label>
                                    <input
                                        type="text"
                                        value={link.url}
                                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                                        placeholder="/menu"
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', marginTop: '1.2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button type="button" onClick={() => moveUp(index)} disabled={index === 0} style={{
                                            padding: '0.4rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1, color: '#fff'
                                        }}>↑</button>
                                        <button type="button" onClick={() => moveDown(index)} disabled={index === links.length - 1} style={{
                                            padding: '0.4rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', cursor: index === links.length - 1 ? 'default' : 'pointer', opacity: index === links.length - 1 ? 0.3 : 1, color: '#fff'
                                        }}>↓</button>
                                    </div>
                                    <button type="button" onClick={() => removeLink(index)} style={{
                                        padding: '0.4rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600'
                                    }}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={addLink}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#a5b4fc',
                        border: '1px dashed rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        marginTop: '1rem',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <span>+</span> Add New Navigation Link
                </button>
            </div>

            {/* Available Pages Reference */}
            <div style={{
                marginTop: '3rem',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                    📄 Available Page URLs Reference
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                    Use these paths in the URL Path field above:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                    {pagesToShow.map((page, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <code style={{
                                background: 'rgba(99, 102, 241, 0.2)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                fontFamily: 'monospace',
                                color: '#a5b4fc',
                                fontWeight: '600',
                                fontSize: '0.85rem'
                            }}>{page.path}</code>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{page.description}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
