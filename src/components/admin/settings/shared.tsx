
import React from 'react';

// Reusable Styles
export const sectionStyle = { padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
export const headerStyle = { fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' };
export const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.5rem', fontWeight: '500' };
export const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };

export function SettingsHeader({ title, onSave, saving }: { title: string, onSave: (e: React.FormEvent) => void, saving: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{title}</h1>
            <button
                onClick={onSave}
                disabled={saving}
                style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: 'var(--primary, #F25F4C)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                }}
            >
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
}
