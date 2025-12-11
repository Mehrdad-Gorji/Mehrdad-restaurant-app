'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CouponForm from './coupon-form';

export default function CouponManager({ initialCoupons, availableProducts = [], availableUsers = [] }: { initialCoupons: any[], availableProducts?: any[], availableUsers?: any[] }) {
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon? This cannot be undone.')) return;

        try {
            await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
            router.refresh();
        } catch (e) {
            console.error(e);
            alert('Failed to delete coupon');
        }
    };

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await fetch('/api/admin/coupons', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !current })
            });
            router.refresh();
        } catch (e) { console.error(e); }
    };

    const openCreateModal = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const openEditModal = (coupon: any) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const openDuplicateModal = (coupon: any) => {
        const copy = { ...coupon, id: null, code: coupon.code + '_COPY', usedCount: 0 };
        setEditingCoupon(copy);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    return (
        <div>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🎟️</span> Coupons
                </h3>
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
                    + Add Coupon
                </button>
            </div>

            {/* List */}
            {initialCoupons.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎟️</div>
                    No coupons found. Create your first one!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {initialCoupons.map((coupon: any) => {
                        const usagePercent = coupon.maxUses ? Math.min(100, (coupon.usedCount / coupon.maxUses) * 100) : 0;
                        const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();

                        return (
                            <div
                                key={coupon.id}
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
                                {/* Code */}
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div style={{
                                        fontWeight: '700',
                                        fontFamily: 'monospace',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {coupon.code}
                                    </div>
                                    {coupon.minAmount && (
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                            Min: {Number(coupon.minAmount)} SEK
                                        </div>
                                    )}
                                </div>

                                {/* Discount */}
                                <div style={{ minWidth: '80px' }}>
                                    <span style={{
                                        padding: '0.3rem 0.6rem',
                                        background: 'rgba(6, 182, 212, 0.15)',
                                        color: '#22d3ee',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '700'
                                    }}>
                                        {Number(coupon.value)} {coupon.type === 'PERCENTAGE' ? '%' : 'SEK'}
                                    </span>
                                </div>

                                {/* Usage */}
                                <div style={{ minWidth: '120px' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>
                                        {coupon.usedCount} used {coupon.maxUses && `of ${coupon.maxUses}`}
                                    </div>
                                    {coupon.maxUses && (
                                        <div style={{
                                            width: '100%',
                                            height: '4px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${usagePercent}%`,
                                                height: '100%',
                                                background: usagePercent >= 100 ? '#ef4444' : '#6366f1'
                                            }} />
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                <div style={{ minWidth: '80px' }}>
                                    <span style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: isExpired
                                            ? 'rgba(239, 68, 68, 0.15)'
                                            : !coupon.isActive
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(16, 185, 129, 0.15)',
                                        color: isExpired
                                            ? '#f87171'
                                            : !coupon.isActive
                                                ? 'rgba(255,255,255,0.5)'
                                                : '#10b981'
                                    }}>
                                        {isExpired ? 'Expired' : !coupon.isActive ? 'Inactive' : 'Active'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => openEditModal(coupon)}
                                        style={{
                                            padding: '0.4rem 0.6rem',
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
                                        onClick={() => openDuplicateModal(coupon)}
                                        style={{
                                            padding: '0.4rem 0.6rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'rgba(255,255,255,0.6)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📋
                                    </button>
                                    <button
                                        onClick={() => handleToggle(coupon.id, coupon.isActive)}
                                        style={{
                                            padding: '0.4rem 0.6rem',
                                            background: coupon.isActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                            color: coupon.isActive ? '#fbbf24' : '#10b981',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {coupon.isActive ? '⏸️' : '▶️'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        style={{
                                            padding: '0.4rem 0.6rem',
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
                        );
                    })}
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
                        maxWidth: '600px',
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
                                {editingCoupon ? (editingCoupon.id ? '✏️ Edit Coupon' : '📋 Duplicate Coupon') : '➕ Create Coupon'}
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

                        <CouponForm
                            initialData={editingCoupon}
                            availableProducts={availableProducts}
                            availableUsers={availableUsers}
                            onSuccess={closeModal}
                            onCancel={closeModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
