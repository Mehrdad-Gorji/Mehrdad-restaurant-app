'use client';

import { useState, useEffect } from 'react';
import ScheduleEditor from '@/components/admin/schedule-editor';

export default function ScheduleSettingsPage() {
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
        let value: string | number | boolean = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
        if (e.target.type === 'checkbox') {
            value = (e.target as HTMLInputElement).checked;
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
                    }}>⏰ Operating Schedule</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Manage store opening hours and closed messages.</p>
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

                {/* Operating Schedule Logic */}
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
                    }}>⚙️ Schedule Configuration</h2>
                    <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        Set the actual opening and closing times for your application logic.
                        When the store is closed based on this schedule, customers will not be able to checkout.
                        <br />
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            ⚠️ Note: This controls functionality, not the text displayed in the footer. Match them manually.
                        </span>
                    </p>

                    {/* Enable/Disable Toggle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: settings.scheduleEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '16px',
                        border: `1px solid ${settings.scheduleEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        transition: 'all 0.3s'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: settings.scheduleEnabled ? '#34d399' : '#fbbf24',
                            width: '100%'
                        }}>
                            <div style={{
                                position: 'relative', width: '60px', height: '32px',
                                background: settings.scheduleEnabled ? '#10b981' : 'rgba(255,255,255,0.1)',
                                borderRadius: '20px', transition: 'all 0.3s'
                            }}>
                                <input
                                    type="checkbox"
                                    name="scheduleEnabled"
                                    checked={settings.scheduleEnabled ?? false}
                                    onChange={handleChange}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <div style={{
                                    position: 'absolute', top: '4px', left: settings.scheduleEnabled ? '32px' : '4px',
                                    width: '24px', height: '24px', background: 'white', borderRadius: '50%',
                                    transition: 'all 0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '1.1rem', color: '#fff' }}>
                                    {settings.scheduleEnabled ? 'Schedule Active' : 'Schedule Inactive'}
                                </span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.8 }}>
                                    {settings.scheduleEnabled
                                        ? 'Store hours are strictly enforced. Checkout disabled outside hours.'
                                        : 'Store is always open. Customers can order anytime.'
                                    }
                                </span>
                            </div>
                        </label>
                    </div>

                    <ScheduleEditor
                        value={settings.operatingSchedule || '{}'}
                        onChange={(val) => setSettings({ ...settings, operatingSchedule: val })}
                    />

                    <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            😴 Shop Closed Message
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
                            Customize the popup message shown to customers when they visit the store outside of operating hours.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Modal Title</label>
                                <input type="text" name="closedTitle" value={settings.closedTitle || ''} onChange={handleChange} style={inputStyle} placeholder="Store is Closed" />
                            </div>
                            <div>
                                <label style={labelStyle}>Button Text (Browse Only)</label>
                                <input type="text" name="closedBtnText" value={settings.closedBtnText || ''} onChange={handleChange} style={inputStyle} placeholder="Browse Menu Only" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Modal Message</label>
                                <textarea
                                    name="closedMessage"
                                    value={settings.closedMessage || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    style={{ ...inputStyle, fontFamily: 'inherit' }}
                                    placeholder="We are currently closed. Please check our opening hours."
                                />
                            </div>
                            <div style={{ paddingTop: '1rem' }}>
                                <label style={labelStyle}>Schedule Section Title</label>
                                <input type="text" name="closedHoursText" value={settings.closedHoursText || ''} onChange={handleChange} style={inputStyle} placeholder="Operating Hours" />
                            </div>
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}
