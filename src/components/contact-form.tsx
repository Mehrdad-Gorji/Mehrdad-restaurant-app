'use client';

import { useState, useEffect } from 'react';
import AuthRequired from '@/components/auth-required';

interface ContactFormProps {
    lang: string;
    translations: {
        name: string;
        email: string;
        phone: string;
        subject: string;
        message: string;
        send: string;
        sending: string;
        success: string;
        error: string;
        subjects: {
            general: string;
            order: string;
            feedback: string;
            partnership: string;
            other: string;
        };
    };
}

export default function ContactForm({ lang, translations }: ContactFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    // Auto-fill form with logged-in user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.user) {
                    if (data.user.name && !formData.name) setFormData(prev => ({ ...prev, name: data.user.name }));
                    if (data.user.email && !formData.email) setFormData(prev => ({ ...prev, email: data.user.email }));
                    if (data.user.phone && !formData.phone) setFormData(prev => ({ ...prev, phone: data.user.phone }));
                }
            } catch {
                // ignore
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem 1.25rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease'
    };

    return (
        <AuthRequired lang={lang}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                            {translations.name} *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={inputStyle}
                            placeholder={translations.name}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                            {translations.email} *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={inputStyle}
                            placeholder={translations.email}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                            {translations.phone}
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            style={inputStyle}
                            placeholder={translations.phone}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                            {translations.subject}
                        </label>
                        <select
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                        >
                            <option value="general" style={{ background: '#1a1a1a' }}>{translations.subjects.general}</option>
                            <option value="order" style={{ background: '#1a1a1a' }}>{translations.subjects.order}</option>
                            <option value="feedback" style={{ background: '#1a1a1a' }}>{translations.subjects.feedback}</option>
                            <option value="partnership" style={{ background: '#1a1a1a' }}>{translations.subjects.partnership}</option>
                            <option value="other" style={{ background: '#1a1a1a' }}>{translations.subjects.other}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {translations.message} *
                    </label>
                    <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                        placeholder={translations.message}
                    />
                </div>

                {status === 'success' && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '12px',
                        color: '#22c55e',
                        textAlign: 'center'
                    }}>
                        ✓ {translations.success}
                    </div>
                )}

                {status === 'error' && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        color: '#ef4444',
                        textAlign: 'center'
                    }}>
                        ✕ {translations.error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{
                        padding: '1rem 2rem',
                        background: status === 'sending'
                            ? 'rgba(255,255,255,0.1)'
                            : 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: status === 'sending' ? 'none' : '0 10px 30px rgba(255, 152, 0, 0.3)'
                    }}
                >
                    {status === 'sending' ? translations.sending : translations.send}
                </button>
            </form>
        </AuthRequired>
    );
}
