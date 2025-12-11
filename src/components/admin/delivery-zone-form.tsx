'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeliveryZoneFormProps {
    initialData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function DeliveryZoneForm({ initialData, onSuccess, onCancel }: DeliveryZoneFormProps) {
    const router = useRouter();
    const isEdit = !!initialData?.id;

    const [zipStart, setZipStart] = useState(initialData?.zipStart || '');
    const [zipEnd, setZipEnd] = useState(initialData?.zipEnd || '');
    const [price, setPrice] = useState(initialData?.price || 0);

    const [name, setName] = useState(initialData?.name || '');
    const [minOrder, setMinOrder] = useState(initialData?.minOrder || '');
    const [freeDeliveryOver, setFreeDeliveryOver] = useState(initialData?.freeDeliveryOver || '');
    const [estimatedTime, setEstimatedTime] = useState(initialData?.estimatedTime || '');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                zipStart,
                zipEnd,
                price: Number(price),
                name: name || null,
                minOrder: minOrder ? Number(minOrder) : null,
                freeDeliveryOver: freeDeliveryOver ? Number(freeDeliveryOver) : null,
                estimatedTime: estimatedTime || null
            };

            let res;
            if (isEdit) {
                res = await fetch('/api/admin/delivery-zones', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: initialData.id, ...payload })
                });
            } else {
                res = await fetch('/api/admin/delivery-zones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                router.refresh();
                if (onSuccess) onSuccess();
            } else {
                const err = await res.json();
                alert('Error: ' + (err.error || 'Failed to save zone'));
            }
        } catch (e) {
            console.error(e);
            alert('An unexpected error occurred.');
        }
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

    const sectionStyle = {
        background: 'rgba(255,255,255,0.03)',
        padding: '1rem',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '1rem'
    };

    const sectionHeader = {
        margin: '0 0 1rem 0',
        fontSize: '0.95rem',
        fontWeight: '600' as const,
        color: '#fff'
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>

            {/* Section 1: Definition */}
            <div style={sectionStyle}>
                <h4 style={sectionHeader}>🌍 Zone Definition</h4>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Zone Name (Optional)</label>
                    <input
                        placeholder="e.g. City Center (Zone A)"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={inputStyle}
                    />
                    <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>A friendly name to help you identify this zone.</small>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Start Zip *</label>
                        <input
                            required
                            placeholder="10000"
                            value={zipStart}
                            onChange={e => setZipStart(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>End Zip *</label>
                        <input
                            required
                            placeholder="19999"
                            value={zipEnd}
                            onChange={e => setZipEnd(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Pricing */}
            <div style={sectionStyle}>
                <h4 style={sectionHeader}>💰 Pricing Rules</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Delivery Fee (SEK) *</label>
                        <input
                            required
                            type="number"
                            value={price}
                            onChange={e => setPrice(Number(e.target.value))}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Free if Order &gt;</label>
                        <input
                            type="number"
                            placeholder="e.g. 500"
                            value={freeDeliveryOver}
                            onChange={e => setFreeDeliveryOver(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Min. Order Value</label>
                    <input
                        type="number"
                        placeholder="e.g. 150"
                        value={minOrder}
                        onChange={e => setMinOrder(e.target.value)}
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Section 3: Logistics */}
            <div style={sectionStyle}>
                <h4 style={sectionHeader}>🚚 Logistics</h4>
                <div>
                    <label style={labelStyle}>Estimated Delivery Time</label>
                    <input
                        placeholder="e.g. 30-45 min"
                        value={estimatedTime}
                        onChange={e => setEstimatedTime(e.target.value)}
                        style={inputStyle}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        padding: '0.85rem',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        flex: 2,
                        padding: '0.85rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Saving...' : (isEdit ? '✓ Update Zone' : '+ Add Zone')}
                </button>
            </div>
        </form>
    );
}
