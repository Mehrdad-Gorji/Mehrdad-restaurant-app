'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeliveryZoneForm from './delivery-zone-form';

export default function DeliveryZoneManager({ initialZones }: { initialZones: any[] }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<any>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this delivery zone?')) return;
        try {
            await fetch(`/api/admin/delivery-zones?id=${id}`, { method: 'DELETE' });
            router.refresh();
        } catch (e) {
            console.error(e);
            alert('Failed to delete zone');
        }
    };

    const openCreateModal = () => {
        setEditingZone(null);
        setIsModalOpen(true);
    };

    const openEditModal = (zone: any) => {
        setEditingZone(zone);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingZone(null);
    };

    return (
        <div>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button
                    onClick={openCreateModal}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                    }}
                >
                    + Add Delivery Zone
                </button>
            </div>

            {/* List */}
            {initialZones.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚚</div>
                    No delivery zones defined.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {initialZones.map((zone: any) => (
                        <div
                            key={zone.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '14px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                flexWrap: 'wrap'
                            }}
                        >
                            {/* Zone Name & Range */}
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                {zone.name && (
                                    <div style={{ fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>
                                        {zone.name}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        color: '#a5b4fc',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '6px',
                                        fontFamily: 'monospace',
                                        fontWeight: '600'
                                    }}>
                                        {zone.zipStart}
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>➔</span>
                                    <span style={{
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        color: '#a5b4fc',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '6px',
                                        fontFamily: 'monospace',
                                        fontWeight: '600'
                                    }}>
                                        {zone.zipEnd}
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div style={{ minWidth: '100px' }}>
                                <div style={{
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {Number(zone.price)} SEK
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                    {zone.freeDeliveryOver && (
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            background: 'rgba(16, 185, 129, 0.15)',
                                            color: '#10b981',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            Free &gt; {Number(zone.freeDeliveryOver)}kr
                                        </span>
                                    )}
                                    {zone.minOrder && (
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            color: '#fbbf24',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            Min {Number(zone.minOrder)}kr
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Estimated Time */}
                            <div style={{ minWidth: '100px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                {zone.estimatedTime ? (
                                    <span>🕒 {zone.estimatedTime}</span>
                                ) : '-'}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => openEditModal(zone)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        color: '#a5b4fc',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(zone.id)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        color: '#f87171',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🗑️
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
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '500px',
                        background: '#1a1a2e',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, color: '#fff', fontWeight: '700' }}>
                                {editingZone ? '✏️ Edit Zone' : '➕ Add New Zone'}
                            </h3>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.5)'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <DeliveryZoneForm
                            initialData={editingZone}
                            onSuccess={closeModal}
                            onCancel={closeModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
