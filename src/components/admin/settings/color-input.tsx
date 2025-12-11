
import React from 'react';

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.5rem', fontWeight: '500' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };

interface ColorInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ColorInput({ label, name, value, onChange }: ColorInputProps) {
    return (
        <div className="form-group">
            <label style={labelStyle}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="color"
                    name={name}
                    value={value || '#000000'}
                    onChange={onChange}
                    style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                />
                <input
                    type="text"
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    style={{ ...inputStyle, width: '120px' }}
                />
            </div>
        </div>
    );
}
