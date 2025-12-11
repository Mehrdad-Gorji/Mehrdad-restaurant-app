'use client';

import { useState, useEffect } from 'react';

interface Review {
    id: string;
    productId: string;
    customerName: string;
    customerEmail: string;
    rating: number;
    comment: string | null;
    isApproved: boolean;
    isVerified: boolean;
    helpfulCount: number;
    createdAt: string;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/reviews?status=${filter}`);
            const data = await res.json();
            setReviews(data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
        try {
            await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, action })
            });
            fetchReviews();
        } catch (error) {
            console.error('Error updating review:', error);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            await fetch(`/api/admin/reviews?id=${reviewId}`, { method: 'DELETE' });
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const renderStars = (rating: number) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const pendingCount = reviews.filter(r => !r.isApproved).length;
    const approvedCount = reviews.filter(r => r.isApproved).length;

    return (
        <div style={{ color: '#fff' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    margin: '0',
                    background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    ⭐ Reviews Management
                </h1>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    Moderate customer reviews
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                padding: '0.75rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)'
            }}>
                {(['pending', 'approved', 'all'] as const).map((tab) => {
                    const gradients: Record<string, string> = {
                        'pending': 'linear-gradient(135deg, #f59e0b, #d97706)',
                        'approved': 'linear-gradient(135deg, #10b981, #059669)',
                        'all': 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    };
                    return (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            style={{
                                padding: '0.6rem 1.25rem',
                                background: filter === tab ? gradients[tab] : 'rgba(255,255,255,0.05)',
                                color: filter === tab ? '#fff' : 'rgba(255,255,255,0.6)',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab === 'pending' ? '⏳ Pending' : tab === 'approved' ? '✅ Approved' : '📋 All'}
                        </button>
                    );
                })}
            </div>

            {/* Reviews List */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                        Loading reviews...
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'rgba(255,255,255,0.4)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                        No {filter} reviews found.
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 100px 2fr 100px 100px 140px',
                            gap: '1rem',
                            padding: '1rem 1.5rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'rgba(255,255,255,0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <div>Customer</div>
                            <div>Rating</div>
                            <div>Comment</div>
                            <div>Date</div>
                            <div>Status</div>
                            <div style={{ textAlign: 'center' }}>Actions</div>
                        </div>

                        {/* Table Body */}
                        {reviews.map((review, idx) => (
                            <div
                                key={review.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.5fr 100px 2fr 100px 100px 140px',
                                    gap: '1rem',
                                    padding: '1rem 1.5rem',
                                    alignItems: 'center',
                                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: '600' }}>{review.customerName}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                        {review.customerEmail}
                                    </div>
                                </div>
                                <div style={{ color: '#fbbf24', fontSize: '1rem' }}>
                                    {renderStars(review.rating)}
                                </div>
                                <div style={{
                                    color: review.comment ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                                    fontStyle: review.comment ? 'normal' : 'italic',
                                    fontSize: '0.9rem'
                                }}>
                                    {review.comment || 'No comment'}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                                <div>
                                    <span style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: review.isApproved
                                            ? 'rgba(16, 185, 129, 0.15)'
                                            : 'rgba(245, 158, 11, 0.15)',
                                        color: review.isApproved ? '#10b981' : '#f59e0b'
                                    }}>
                                        {review.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    {!review.isApproved && (
                                        <button
                                            onClick={() => handleAction(review.id, 'approve')}
                                            style={{
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.4rem 0.75rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ✓
                                        </button>
                                    )}
                                    {review.isApproved && (
                                        <button
                                            onClick={() => handleAction(review.id, 'reject')}
                                            style={{
                                                background: 'rgba(245, 158, 11, 0.15)',
                                                color: '#f59e0b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.4rem 0.75rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Hide
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#f87171',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.4rem 0.75rem',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
