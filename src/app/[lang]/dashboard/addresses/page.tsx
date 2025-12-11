'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Address {
    id: string;
    street: string;
    city: string;
    zipCode: string;
    floor?: string;
    doorCode?: string;
}

export default function AddressesPage() {
    const { lang } = useParams();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [floor, setFloor] = useState('');
    const [doorCode, setDoorCode] = useState('');

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/auth/addresses');
            const data = await res.json();
            setAddresses(data.addresses || []);
        } catch { } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStreet('');
        setCity('');
        setZipCode('');
        setFloor('');
        setDoorCode('');
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (address: Address) => {
        setStreet(address.street);
        setCity(address.city);
        setZipCode(address.zipCode);
        setFloor(address.floor || '');
        setDoorCode(address.doorCode || '');
        setEditingId(address.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(lang === 'fa' ? 'آیا مطمئن هستید؟' : 'Are you sure you want to delete this address?')) return;

        try {
            await fetch(`/api/auth/addresses/${id}`, { method: 'DELETE' });
            setAddresses(addresses.filter(a => a.id !== id));
        } catch { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!street || !city || !zipCode) return;

        setSaving(true);
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/auth/addresses/${editingId}` : '/api/auth/addresses';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ street, city, zipCode, floor, doorCode })
            });

            if (res.ok) {
                resetForm();
                fetchAddresses();
            }
        } catch { } finally {
            setSaving(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.875rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none'
    };

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            position: 'relative',
            paddingTop: '2rem',
            paddingBottom: '4rem'
        }}>
            {/* Background Orb */}
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                bottom: '-200px',
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link href={`/${lang}/dashboard`} style={{
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        ← {lang === 'fa' ? 'بازگشت به داشبورد' : 'Back to Dashboard'}
                    </Link>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{
                                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                                background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '800'
                            }}>
                                📍 {lang === 'fa' ? 'آدرس‌های ذخیره شده' : 'Saved Addresses'}
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                                {lang === 'fa' ? 'حداکثر 2 آدرس می‌توانید ذخیره کنید' : 'You can save up to 2 addresses'}
                            </p>
                        </div>
                        {!showForm && addresses.length < 2 && (
                            <button
                                onClick={() => setShowForm(true)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                    border: 'none',
                                    borderRadius: '50px',
                                    color: '#fff',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem'
                                }}
                            >
                                ➕ {lang === 'fa' ? 'افزودن آدرس' : 'Add Address'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '2rem',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>
                            {editingId ? (lang === 'fa' ? 'ویرایش آدرس' : 'Edit Address') : (lang === 'fa' ? 'افزودن آدرس جدید' : 'Add New Address')}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder={lang === 'fa' ? 'خیابان و پلاک' : 'Street Address'}
                                    value={street}
                                    onChange={e => setStreet(e.target.value)}
                                    style={inputStyle}
                                    required
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder={lang === 'fa' ? 'کد پستی' : 'Zip Code'}
                                        value={zipCode}
                                        onChange={e => setZipCode(e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder={lang === 'fa' ? 'شهر' : 'City'}
                                        value={city}
                                        onChange={e => setCity(e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder={lang === 'fa' ? 'طبقه (اختیاری)' : 'Floor (optional)'}
                                        value={floor}
                                        onChange={e => setFloor(e.target.value)}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder={lang === 'fa' ? 'کد درب (اختیاری)' : 'Door Code (optional)'}
                                        value={doorCode}
                                        onChange={e => setDoorCode(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontWeight: '600',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {saving ? '...' : (editingId ? (lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes') : (lang === 'fa' ? 'ذخیره آدرس' : 'Save Address'))}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        padding: '0.875rem 1.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: 'rgba(255,255,255,0.7)',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {lang === 'fa' ? 'انصراف' : 'Cancel'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Address List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
                ) : addresses.length === 0 && !showForm ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '4rem 2rem',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🏠</span>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>
                            {lang === 'fa' ? 'آدرسی ذخیره نشده' : 'No saved addresses'}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
                            {lang === 'fa' ? 'اولین آدرس خود را اضافه کنید' : 'Add your first delivery address'}
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                padding: '0.75rem 2rem',
                                background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                                border: 'none',
                                borderRadius: '50px',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ➕ {lang === 'fa' ? 'افزودن آدرس' : 'Add Address'}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {addresses.map((address, idx) => (
                            <div key={address.id} style={{
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                                    <span style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,152,0,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        flexShrink: 0
                                    }}>
                                        {idx === 0 ? '🏠' : '🏢'}
                                    </span>
                                    <div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                            {idx === 0 ? (lang === 'fa' ? 'آدرس اول' : 'Primary Address') : (lang === 'fa' ? 'آدرس دوم' : 'Secondary Address')}
                                        </div>
                                        <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.5rem' }}>
                                            {address.street}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                            {address.zipCode}, {address.city}
                                        </div>
                                        {(address.floor || address.doorCode) && (
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                                {address.floor && `${lang === 'fa' ? 'طبقه' : 'Floor'}: ${address.floor}`}
                                                {address.floor && address.doorCode && ' • '}
                                                {address.doorCode && `${lang === 'fa' ? 'کد' : 'Code'}: ${address.doorCode}`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleEdit(address)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: '#ff9800',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        ✏️ {lang === 'fa' ? 'ویرایش' : 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            borderRadius: '8px',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
