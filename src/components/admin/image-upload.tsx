'use client';

import { useState } from 'react';

interface Props {
    value: string;
    onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            onChange(data.url);
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                    type="text"
                    className="input"
                    placeholder="https://... or upload"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    style={{ flex: 1 }}
                />
                <label className="btn btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                </label>
            </div>
            {value && (
                <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                    <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            )}
        </div>
    );
}
