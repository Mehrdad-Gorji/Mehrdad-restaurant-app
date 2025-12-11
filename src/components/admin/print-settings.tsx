'use client';

import { useState, useEffect } from 'react';

// Paper format options
export const PAPER_FORMATS = {
    // Thermal printer sizes
    THERMAL_80MM: { id: 'thermal_80mm', name: 'Thermal 80mm', type: 'thermal', width: '80mm', description: 'Standard thermal receipt' },
    THERMAL_58MM: { id: 'thermal_58mm', name: 'Thermal 58mm', type: 'thermal', width: '58mm', description: 'Small thermal receipt' },
    THERMAL_110MM: { id: 'thermal_110mm', name: 'Thermal 110mm', type: 'thermal', width: '110mm', description: 'Wide thermal receipt' },
    // Regular paper sizes
    A4: { id: 'a4', name: 'A4', type: 'paper', width: '210mm', height: '297mm', description: 'Standard A4 paper' },
    A5: { id: 'a5', name: 'A5', type: 'paper', width: '148mm', height: '210mm', description: 'Half A4 size' },
    LETTER: { id: 'letter', name: 'Letter', type: 'paper', width: '216mm', height: '279mm', description: 'US Letter size' },
};

export type PaperFormatId = keyof typeof PAPER_FORMATS;

export interface PrintSettings {
    printerType: 'thermal' | 'pixel';
    paperFormat: PaperFormatId;
    autoPrint: boolean;
    showLogo: boolean;
    fontSize: 'small' | 'medium' | 'large';
    copies: number;
    autoCut: boolean;
    shopName: string;
    shopAddress: string;
    shopPhone: string;
    thankYouMessage: string;
}

const DEFAULT_SETTINGS: PrintSettings = {
    printerType: 'thermal',
    paperFormat: 'THERMAL_80MM',
    autoPrint: true,
    showLogo: false,
    fontSize: 'medium',
    copies: 1,
    autoCut: true,
    shopName: 'Palmas Pizzeria',
    shopAddress: '',
    shopPhone: '',
    thankYouMessage: 'Thank you for your order!',
};

export function getPrintSettings(): PrintSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const stored = localStorage.getItem('print_settings');
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Error reading print settings:', e);
    }
    return DEFAULT_SETTINGS;
}

export function savePrintSettings(settings: PrintSettings): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('print_settings', JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving print settings:', e);
    }
}

export function getPaperFormat(formatId: PaperFormatId) {
    return PAPER_FORMATS[formatId] || PAPER_FORMATS.THERMAL_80MM;
}

export default function PrintSettingsSection() {
    const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        setSettings(getPrintSettings());
    }, []);

    const handleChange = (key: keyof PrintSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        savePrintSettings(newSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const loadFromSiteSettings = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const siteSettings = await res.json();
                const newSettings = {
                    ...settings,
                    shopName: siteSettings.brandName || settings.shopName,
                    shopAddress: siteSettings.footerAddress || settings.shopAddress,
                    shopPhone: siteSettings.footerPhone || settings.shopPhone,
                };
                setSettings(newSettings);
                savePrintSettings(newSettings);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (e) {
            console.error('Error loading site settings:', e);
        }
        setSyncing(false);
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

    const optionButtonStyle = (active: boolean): React.CSSProperties => ({
        padding: '1rem',
        borderRadius: '12px',
        border: active ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
        background: active ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    });

    return (
        <div>
            {saved && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px',
                    background: '#10b981', color: 'white', padding: '0.75rem 1.5rem',
                    borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    ✅ Print settings saved!
                </div>
            )}

            {/* Printer Type Selection */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>🖨️ Printer Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => handleChange('printerType', 'thermal')} style={optionButtonStyle(settings.printerType === 'thermal')}>
                        <div style={{ fontWeight: '600', color: settings.printerType === 'thermal' ? '#818cf8' : '#e5e7eb', fontSize: '1rem' }}>🧾 Thermal Printer</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Uses ESC/POS commands. Best for high-speed POS receipt printers.</div>
                    </button>
                    <button type="button" onClick={() => handleChange('printerType', 'pixel')} style={optionButtonStyle(settings.printerType === 'pixel')}>
                        <div style={{ fontWeight: '600', color: settings.printerType === 'pixel' ? '#818cf8' : '#e5e7eb', fontSize: '1rem' }}>📄 Standard / A4 Printer</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Uses HTML/Pixel printing. Works with all printers (HP, Canon, etc).</div>
                    </button>
                </div>
            </div>

            {/* Paper Format Selection */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>📄 Paper Format</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                    {Object.entries(PAPER_FORMATS).map(([key, format]) => (
                        <button key={key} type="button" onClick={() => handleChange('paperFormat', key as PaperFormatId)} style={optionButtonStyle(settings.paperFormat === key)}>
                            <div style={{ fontWeight: '600', color: settings.paperFormat === key ? '#818cf8' : '#e5e7eb', fontSize: '0.95rem' }}>
                                {format.type === 'thermal' ? '🖨️' : '📄'} {format.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{format.description}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Width: {format.width}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Print Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                {/* Auto Print */}
                <div>
                    <label style={labelStyle}>🔄 Auto-Print New Orders</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={() => handleChange('autoPrint', true)} style={{
                            flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
                            background: settings.autoPrint ? '#10b981' : 'rgba(255,255,255,0.05)', color: settings.autoPrint ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: '600'
                        }}>Enabled</button>
                        <button type="button" onClick={() => handleChange('autoPrint', false)} style={{
                            flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
                            background: !settings.autoPrint ? '#ef4444' : 'rgba(255,255,255,0.05)', color: !settings.autoPrint ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: '600'
                        }}>Disabled</button>
                    </div>
                </div>

                {/* Font Size */}
                <div>
                    <label style={labelStyle}>🔤 Font Size</label>
                    <select value={settings.fontSize} onChange={(e) => handleChange('fontSize', e.target.value)} style={inputStyle}>
                        <option value="small" style={{ color: '#000' }}>Small (10px)</option>
                        <option value="medium" style={{ color: '#000' }}>Medium (12px)</option>
                        <option value="large" style={{ color: '#000' }}>Large (14px)</option>
                    </select>
                </div>

                {/* Copies */}
                <div>
                    <label style={labelStyle}>📋 Number of Copies</label>
                    <input type="number" min="1" max="10" value={settings.copies} onChange={(e) => handleChange('copies', parseInt(e.target.value) || 1)} style={inputStyle} />
                </div>

                {/* Auto Cut */}
                <div>
                    <label style={labelStyle}>✂️ Auto-Cut Paper (Thermal)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={() => handleChange('autoCut', true)} style={{
                            flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
                            background: settings.autoCut ? '#10b981' : 'rgba(255,255,255,0.05)', color: settings.autoCut ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: '600'
                        }}>Enabled</button>
                        <button type="button" onClick={() => handleChange('autoCut', false)} style={{
                            flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
                            background: !settings.autoCut ? '#ef4444' : 'rgba(255,255,255,0.05)', color: !settings.autoCut ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: '600'
                        }}>Disabled</button>
                    </div>
                </div>
            </div>

            {/* Shop Info */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h4 style={{ fontWeight: '700', margin: 0, color: '#fff', fontSize: '1.1rem' }}>🏪 Receipt Shop Info</h4>
                    <button type="button" onClick={loadFromSiteSettings} disabled={syncing} style={{
                        padding: '0.6rem 1.2rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white', border: 'none', borderRadius: '8px', cursor: syncing ? 'wait' : 'pointer', fontSize: '0.9rem', fontWeight: '600', opacity: syncing ? 0.7 : 1, boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                    }}>
                        {syncing ? '⏳ Loading...' : '🔄 Load from Site Settings'}
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Shop Name</label>
                        <input type="text" value={settings.shopName} onChange={(e) => handleChange('shopName', e.target.value)} placeholder="Your Shop Name" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        <input type="text" value={settings.shopPhone} onChange={(e) => handleChange('shopPhone', e.target.value)} placeholder="+49..." style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Shop Address</label>
                        <input type="text" value={settings.shopAddress} onChange={(e) => handleChange('shopAddress', e.target.value)} placeholder="Street..." style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Thank You Message</label>
                        <input type="text" value={settings.thankYouMessage} onChange={(e) => handleChange('thankYouMessage', e.target.value)} placeholder="Thank you..." style={inputStyle} />
                    </div>
                </div>
            </div>

            {/* Print Preview */}
            <PrintPreview settings={settings} />
        </div>
    );
}

const SAMPLE_ORDER = {
    id: 'ABC12345-6789-DEMO',
    createdAt: new Date().toISOString(),
    status: 'PREPARING',
    deliveryMethod: 'DELIVERY',
    total: 245,
    items: [
        { name: 'Margarita Pizza', quantity: 2, price: 95, size: 'Large' },
        { name: 'Pepperoni Pizza', quantity: 1, price: 55, size: 'Medium', extras: ['Extra Cheese', 'Jalapeños'] },
    ],
    customer: {
        name: 'Max Mustermann',
        phone: '+49 123 456789',
        street: 'Hauptstraße 42',
        city: 'Berlin',
        zip: '10115',
    }
};

function PrintPreview({ settings }: { settings: PrintSettings }) {
    const format = PAPER_FORMATS[settings.paperFormat];
    const isThermal = format?.type === 'thermal';
    const widthPx = parseInt(format?.width || '80') * 3;
    const heightPx = isThermal ? 'auto' : parseInt((format as any)?.height || '297') * 2;
    const fontSizes = {
        small: { base: 9, header: 12, line: 7 },
        medium: { base: 11, header: 14, line: 9 },
        large: { base: 13, header: 16, line: 11 }
    };
    const fs = fontSizes[settings.fontSize];
    const line = isThermal ? '━'.repeat(30) : null;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👁️ Print Preview
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>({format?.name} - {format?.width})</span>
            </h4>

            <div style={{
                display: 'flex', justifyContent: 'center', padding: '3rem',
                background: '#111827', borderRadius: '16px', overflow: 'auto',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundImage: 'radial-gradient(#374151 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}>
                <div style={{
                    width: `${widthPx}px`,
                    minHeight: typeof heightPx === 'number' ? `${heightPx}px` : undefined,
                    background: '#fff',
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.5)',
                    padding: isThermal ? '12px' : '24px',
                    fontFamily: isThermal ? "'Courier New', monospace" : "'Segoe UI', Arial, sans-serif",
                    fontSize: `${fs.base}px`,
                    color: '#000',
                    borderRadius: isThermal ? '0' : '4px',
                    border: isThermal ? 'none' : '1px solid #e5e7eb'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: isThermal ? '8px' : '16px' }}>
                        <div style={{ fontSize: `${fs.header + 4}px`, fontWeight: 'bold' }}>{settings.shopName || 'Shop Name'}</div>
                        {settings.shopAddress && <div style={{ fontSize: `${fs.line}px`, color: '#666', marginTop: '2px' }}>{settings.shopAddress}</div>}
                        {settings.shopPhone && <div style={{ fontSize: `${fs.line}px`, color: '#666' }}>Tel: {settings.shopPhone}</div>}
                        <div style={{ fontSize: `${fs.line}px`, color: '#666', marginTop: '4px' }}>Order Receipt</div>
                    </div>

                    {isThermal ? <div style={{ fontSize: `${fs.line}px`, textAlign: 'center', color: '#999' }}>{line}</div> : <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '12px 0' }} />}

                    <div style={{ margin: isThermal ? '6px 0' : '12px 0' }}>
                        <div><strong>Order #:</strong> {SAMPLE_ORDER.id.slice(0, 8).toUpperCase()}</div>
                        <div><strong>Date:</strong> {new Date().toLocaleString('sv-SE')}</div>
                        <div><strong>Type:</strong> {SAMPLE_ORDER.deliveryMethod}</div>
                    </div>

                    {isThermal ? <div style={{ fontSize: `${fs.line}px`, textAlign: 'center', color: '#999' }}>{line}</div> : <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '12px 0' }} />}

                    <div style={{ margin: isThermal ? '6px 0' : '12px 0' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🛒 Items</div>
                        {isThermal ? (
                            SAMPLE_ORDER.items.map((item, i) => (
                                <div key={i} style={{ marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>{item.price * item.quantity} SEK</span>
                                    </div>
                                    <div style={{ fontSize: `${fs.line}px`, color: '#666', paddingLeft: '12px' }}>Size: {item.size}</div>
                                    {item.extras?.map((ex, j) => <div key={j} style={{ fontSize: `${fs.line}px`, color: '#666', paddingLeft: '12px' }}>+ {ex}</div>)}
                                </div>
                            ))
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${fs.base}px` }}>
                                <thead>
                                    <tr style={{ background: '#f9f9f9' }}>
                                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Item</th>
                                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SAMPLE_ORDER.items.map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                                {item.quantity}x {item.name}<br /><small style={{ color: '#666' }}>Size: {item.size}</small>
                                                {item.extras?.map((ex, j) => <span key={j}><br /><small style={{ color: '#666' }}>+ {ex}</small></span>)}
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right', verticalAlign: 'top', borderBottom: '1px solid #eee' }}>{item.price * item.quantity} SEK</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {isThermal ? <div style={{ fontSize: `${fs.line}px`, textAlign: 'center', color: '#999' }}>{line}</div> : <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '12px 0' }} />}

                    <div style={{ textAlign: 'right', fontSize: `${fs.header}px`, fontWeight: 'bold', margin: isThermal ? '8px 0' : '16px 0' }}>
                        TOTAL: {SAMPLE_ORDER.total} SEK
                    </div>

                    <div style={{ textAlign: 'center', fontSize: `${fs.line}px`, color: '#666', marginTop: isThermal ? '8px' : '16px' }}>
                        {settings.thankYouMessage || 'Thank you for your order!'}
                    </div>
                </div>
            </div>
        </div>
    );
}
