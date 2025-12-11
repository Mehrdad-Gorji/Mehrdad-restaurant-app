'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import ResponsiveGrid from '@/components/admin/responsive-grid';

export default function QRGeneratorPage() {
    const [text, setText] = useState('');
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [includeImage, setIncludeImage] = useState(false);

    const downloadQR = () => {
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `qr-code.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const predefinedLinks = [
        { label: '🏠 Homepage', value: typeof window !== 'undefined' ? window.location.origin : '' },
        { label: '🍕 Menu', value: typeof window !== 'undefined' ? `${window.location.origin}/en/menu` : '' },
        { label: '✍️ Review', value: 'https://g.page/r/...' }, // Placeholder
    ];

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
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
        marginBottom: '0.5rem'
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    marginTop: 0,
                    marginBottom: '0.5rem',
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>📱 QR Code Generator</h1>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Create custom QR codes for your tables, menus, or marketing materials.</p>
            </div>

            <ResponsiveGrid columns="2-1">

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Content Section */}
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
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            paddingBottom: '1rem'
                        }}>🔗 QR Content</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>URL or Text</label>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="https://example.com"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {predefinedLinks.map(link => (
                                <button
                                    key={link.label}
                                    onClick={() => setText(link.value)}
                                    style={{
                                        padding: '0.6rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: '#fff',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Appearance Section */}
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
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            paddingBottom: '1rem'
                        }}>🎨 Appearance</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Foreground Color</label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <input
                                            type="color"
                                            value={fgColor}
                                            onChange={(e) => setFgColor(e.target.value)}
                                            style={{
                                                position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                                                padding: 0, margin: 0, border: 'none', cursor: 'pointer'
                                            }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        style={{ ...inputStyle, width: '100%', padding: '0.6rem' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Background Color</label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            style={{
                                                position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                                                padding: 0, margin: 0, border: 'none', cursor: 'pointer'
                                            }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        style={{ ...inputStyle, width: '100%', padding: '0.6rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                                <span>Size (px)</span>
                                <span style={{ color: '#a5b4fc' }}>{size}px</span>
                            </label>
                            <input
                                type="range"
                                min="128"
                                max="1024"
                                step="32"
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer', accentColor: '#6366f1' }}
                            />
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: includeImage ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: includeImage ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.3s'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', width: '100%' }}>
                                <div style={{
                                    position: 'relative', width: '50px', height: '28px',
                                    background: includeImage ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '20px', transition: 'all 0.3s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={includeImage}
                                        onChange={(e) => setIncludeImage(e.target.checked)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <div style={{
                                        position: 'absolute', top: '3px', left: includeImage ? '25px' : '3px',
                                        width: '22px', height: '22px', background: 'white', borderRadius: '50%',
                                        transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '500' }}>Include Center Logo</span>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Preview */}
                <div>
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '2rem',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem',
                        position: 'sticky',
                        top: '2rem'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: '600' }}>👀 Live Preview</h3>

                        <div style={{
                            padding: '1.5rem',
                            background: 'white', // QR canvas needs white contrast or user specified bg
                            borderRadius: '16px',
                            border: '4px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '256px', // Fixed preview size
                                height: '256px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden' // In case the actual canvas is huge
                            }}>
                                <QRCodeCanvas
                                    id="qr-canvas"
                                    value={text || 'https://example.com'}
                                    size={size} // Actual size for download
                                    fgColor={fgColor}
                                    bgColor={bgColor}
                                    level="H"
                                    includeMargin={true}
                                    style={{ width: '100% !important', height: 'auto !important', maxWidth: '100%' }} // Responsive preview
                                    imageSettings={includeImage ? {
                                        src: "/logo.png", // Assuming logo exists in public
                                        x: undefined,
                                        y: undefined,
                                        height: size * 0.2,
                                        width: size * 0.2,
                                        excavate: true,
                                    } : undefined}
                                />
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                            Preview is scaled. Downloaded file will be {size}x{size}px.
                        </div>

                        <button
                            onClick={downloadQR}
                            disabled={!text}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: !text ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: !text ? 'rgba(255,255,255,0.3)' : 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: !text ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: !text ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.4)',
                                transition: 'all 0.3s'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>⬇️</span> Download PNG
                        </button>

                        {!text && (
                            <div style={{
                                padding: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5',
                                borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                                Please enter text or URL to generate
                            </div>
                        )}
                    </div>
                </div>
            </ResponsiveGrid>
        </div>
    );
}
