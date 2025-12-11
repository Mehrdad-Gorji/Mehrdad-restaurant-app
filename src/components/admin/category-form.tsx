'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './image-upload';

export default function CategoryForm() {
    const router = useRouter();
    const [slug, setSlug] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [nameSv, setNameSv] = useState('');
    const [nameDe, setNameDe] = useState('');
    const [nameFa, setNameFa] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug, nameEn, nameSv, nameDe, nameFa, image
                })
            });
            if (res.ok) {
                setSlug('');
                setNameEn('');
                setNameSv('');
                setNameDe('');
                setNameFa('');
                setImage('');
                router.refresh();
            } else {
                alert('Error creating category');
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500' as const
    };

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Slug (Unique ID)</label>
                    <input
                        required
                        placeholder="e.g. pizza"
                        value={slug}
                        onChange={e => setSlug(e.target.value.toLowerCase())}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Category Image</label>
                    <ImageUpload value={image} onChange={setImage} />
                </div>
                <div>
                    <label style={labelStyle}>Name (English) *</label>
                    <input
                        required
                        value={nameEn}
                        onChange={e => setNameEn(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Name (Swedish)</label>
                    <input
                        value={nameSv}
                        onChange={e => setNameSv(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Name (German)</label>
                    <input
                        value={nameDe}
                        onChange={e => setNameDe(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Name (Persian)</label>
                    <input
                        value={nameFa}
                        onChange={e => setNameFa(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0.85rem 1.5rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loading ? 'Adding...' : '+ Add Category'}
                </button>
            </form>
        </div>
    );
}
