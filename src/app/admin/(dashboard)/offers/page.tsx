'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/image-upload';
import { useRouter } from 'next/navigation';
import BackToDashboard from '@/components/admin/back-to-dashboard';

export default function AdminOffersPage() {
    const router = useRouter();
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchOffers = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/offers');
        if (res.ok) {
            const data = await res.json();
            setOffers(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setImage('');
        setDiscountCode('');
        setIsActive(true);
        setStartDate('');
        setEndDate('');
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleEdit = (offer: any) => {
        setIsEditing(true);
        setCurrentId(offer.id);
        setTitle(offer.title);
        setDescription(offer.description || '');
        setImage(offer.image || '');
        setDiscountCode(offer.discountCode || '');
        setIsActive(offer.isActive);
        setStartDate(offer.startDate ? offer.startDate.split('T')[0] : '');
        setEndDate(offer.endDate ? offer.endDate.split('T')[0] : '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
        fetchOffers();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title,
            description,
            image,
            discountCode,
            isActive,
            startDate: startDate || null,
            endDate: endDate || null,
            translations: [{ language: 'en', title, description }]
        };

        const url = isEditing ? `/api/admin/offers/${currentId}` : '/api/admin/offers';
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setIsModalOpen(false);
            resetForm();
            fetchOffers();
            router.refresh();
        } else {
            alert('Failed to save offer');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
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

    return (
        <div style={{ padding: '2rem' }}>
            <BackToDashboard />
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
                    }}>🏷️ Offers Manager</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Manage special offers and promotions</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>+</span> New Offer
                </button>
            </div>

            {loading ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {offers.map(offer => (
                        <div key={offer.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ height: '180px', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                {offer.image ? (
                                    <img
                                        src={offer.image.startsWith('http') || offer.image.startsWith('/') ? offer.image : `/api/uploads/${offer.image}`}
                                        alt={offer.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🎉</div>
                                )}
                                {!offer.isActive && (
                                    <div style={{
                                        position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.8)', color: 'white',
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>INACTIVE</div>
                                )}
                            </div>
                            <div style={{ padding: '1.25rem', flex: 1 }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.25rem' }}>{offer.title}</h3>
                                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', lineHeight: '1.5' }}>{offer.description}</p>
                                {offer.discountCode && (
                                    <div style={{
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#34d399',
                                        border: '1px dashed rgba(16, 185, 129, 0.3)',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        fontSize: '0.95rem',
                                        fontWeight: '600'
                                    }}>
                                        Code: <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{offer.discountCode}</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: 'rgba(0,0,0,0.2)' }}>
                                <button onClick={() => handleEdit(offer)} style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    color: '#60a5fa',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(offer.id)} style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        width: '100%', maxWidth: '600px',
                        background: '#1f2937',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{
                            marginTop: 0,
                            marginBottom: '1.5rem',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#fff'
                        }}>
                            {isEditing ? 'Edit Offer' : 'New Offer'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={labelStyle}>Title</label>
                                <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Summer Special" />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea style={{ ...inputStyle, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the offer details..." />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={labelStyle}>Image</label>
                                <ImageUpload value={image} onChange={setImage} />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={labelStyle}>Discount Coupon Code (Optional)</label>
                                <input style={inputStyle} value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="e.g. SUMMER24" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Start Date</label>
                                    <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>End Date</label>
                                    <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer' }}>
                                    <div style={{ position: 'relative', width: '40px', height: '20px' }}>
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={e => setIsActive(e.target.checked)}
                                            style={{ opacity: 0, width: 0, height: 0 }}
                                        />
                                        <span style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: isActive ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                                            borderRadius: '34px',
                                            transition: '.4s'
                                        }}></span>
                                        <span style={{
                                            position: 'absolute', content: '""', height: '14px', width: '14px', left: isActive ? '23px' : '3px', bottom: '3px',
                                            backgroundColor: 'white', borderRadius: '50%', transition: '.4s'
                                        }}></span>
                                    </div>
                                    <span>Active / Visible</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.7)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                                }}>Save Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
