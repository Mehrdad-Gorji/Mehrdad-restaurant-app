'use client';

import PrintSettingsSection from '@/components/admin/print-settings';
import VATSettingsSection from '@/components/admin/vat-settings';

export default function SalesSettingsPage() {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    marginTop: 0,
                    marginBottom: '0.5rem',
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>Sales & Tax Settings</h1>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Configure taxes, receipts, and printing behavior.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* 8. Print Settings */}
                <section id="print" style={{
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
                    }}>🖨️ Print Settings</h2>
                    <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                        Configure receipt printing for orders. Settings are saved automatically.
                    </p>
                    <PrintSettingsSection />
                </section>

                {/* 9. VAT / Tax Settings */}
                <section id="vat" style={{
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
                    }}>💰 VAT / Tax Settings</h2>
                    <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                        Configure EU VAT rates for Germany, Sweden, and other countries. Settings save automatically.
                    </p>
                    <VATSettingsSection />
                </section>
            </div>
        </div>
    );
}
