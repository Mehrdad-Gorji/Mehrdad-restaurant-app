'use client';

import { useState, useEffect } from 'react';

interface Review {
    id: string;
    customerName: string;
    rating: number;
    comment: string | null;
    helpfulCount: number;
    createdAt: string;
    isVerified: boolean;
}

interface ReviewListProps {
    productId: string;
    lang?: string;
}

export default function ReviewList({ productId, lang = 'en' }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [total, setTotal] = useState(0);
    const [distribution, setDistribution] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);

    const labels = {
        en: {
            reviews: 'Reviews',
            noReviews: 'No reviews yet. Be the first to review!',
            helpful: 'Helpful',
            verified: 'Verified Purchase',
            basedOn: 'Based on'
        },
        sv: {
            reviews: 'Recensioner',
            noReviews: 'Inga recensioner ännu. Var först att recensera!',
            helpful: 'Hjälpsam',
            verified: 'Verifierat köp',
            basedOn: 'Baserat på'
        },
        de: {
            reviews: 'Bewertungen',
            noReviews: 'Noch keine Bewertungen. Seien Sie der Erste!',
            helpful: 'Hilfreich',
            verified: 'Verifizierter Kauf',
            basedOn: 'Basierend auf'
        },
        fa: {
            reviews: 'نظرات',
            noReviews: 'هنوز نظری ثبت نشده. اولین نفر باشید!',
            helpful: 'مفید بود',
            verified: 'خرید تایید شده',
            basedOn: 'بر اساس'
        }
    };

    const t = labels[lang as keyof typeof labels] || labels.en;

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            setReviews(data.reviews || []);
            setAvgRating(data.averageRating || 0);
            setTotal(data.total || 0);
            setDistribution(data.distribution || {});
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleHelpful = async (reviewId: string) => {
        try {
            await fetch('/api/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId })
            });
            fetchReviews();
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    const renderStars = (rating: number, size: string = '1rem') => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        style={{
                            color: rating >= star ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                            fontSize: size
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                Loading reviews...
            </div>
        );
    }

    return (
        <div>
            {/* Rating Summary */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    {/* Average */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            color: '#fbbf24',
                            lineHeight: 1
                        }}>
                            {avgRating.toFixed(1)}
                        </div>
                        {renderStars(Math.round(avgRating), '1.5rem')}
                        <div style={{
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.5)',
                            marginTop: '0.5rem'
                        }}>
                            {t.basedOn} {total} {t.reviews.toLowerCase()}
                        </div>
                    </div>

                    {/* Distribution */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        {[5, 4, 3, 2, 1].map((stars) => (
                            <div key={stars} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.25rem'
                            }}>
                                <span style={{ width: '20px', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                    {stars}
                                </span>
                                <div style={{
                                    flex: 1,
                                    height: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: total > 0 ? `${((distribution[stars] || 0) / total) * 100}%` : '0%',
                                        height: '100%',
                                        background: '#fbbf24',
                                        borderRadius: '4px',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                                <span style={{ width: '30px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                    {distribution[stars] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px'
                }}>
                    💭 {t.noReviews}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                padding: '1.25rem'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.75rem',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                <div>
                                    <div style={{
                                        fontWeight: '600',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {review.customerName}
                                        {review.isVerified && (
                                            <span style={{
                                                background: 'rgba(34, 197, 94, 0.2)',
                                                color: '#22c55e',
                                                fontSize: '0.7rem',
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '50px'
                                            }}>
                                                ✓ {t.verified}
                                            </span>
                                        )}
                                    </div>
                                    {renderStars(review.rating, '1rem')}
                                </div>
                                <span style={{
                                    fontSize: '0.8rem',
                                    color: 'rgba(255,255,255,0.4)'
                                }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {review.comment && (
                                <p style={{
                                    margin: '0 0 1rem',
                                    color: 'rgba(255,255,255,0.7)',
                                    lineHeight: 1.6
                                }}>
                                    {review.comment}
                                </p>
                            )}

                            <button
                                onClick={() => handleHelpful(review.id)}
                                style={{
                                    background: 'none',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '50px',
                                    padding: '0.35rem 0.75rem',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                👍 {t.helpful} ({review.helpfulCount})
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
