'use client';

import { useState } from 'react';

interface ReviewFormProps {
    productId: string;
    productName: string;
    lang?: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ productId, productName, lang = 'en', onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const labels = {
        en: {
            title: 'Write a Review',
            name: 'Your Name',
            email: 'Your Email',
            rating: 'Rating',
            comment: 'Your Review (optional)',
            submit: 'Submit Review',
            submitting: 'Submitting...',
            success: 'Thank you! Your review has been submitted and will appear after approval.',
            alreadyReviewed: 'You have already reviewed this product'
        },
        sv: {
            title: 'Skriv en recension',
            name: 'Ditt Namn',
            email: 'Din E-post',
            rating: 'Betyg',
            comment: 'Din recension (valfritt)',
            submit: 'Skicka recension',
            submitting: 'Skickar...',
            success: 'Tack! Din recension har skickats och kommer att visas efter godkännande.',
            alreadyReviewed: 'Du har redan recenserat denna produkt'
        },
        de: {
            title: 'Bewertung schreiben',
            name: 'Ihr Name',
            email: 'Ihre E-Mail',
            rating: 'Bewertung',
            comment: 'Ihre Bewertung (optional)',
            submit: 'Bewertung abschicken',
            submitting: 'Wird gesendet...',
            success: 'Danke! Ihre Bewertung wurde übermittelt und wird nach Genehmigung angezeigt.',
            alreadyReviewed: 'Sie haben dieses Produkt bereits bewertet'
        },
        fa: {
            title: 'نوشتن نظر',
            name: 'نام شما',
            email: 'ایمیل شما',
            rating: 'امتیاز',
            comment: 'نظر شما (اختیاری)',
            submit: 'ارسال نظر',
            submitting: 'در حال ارسال...',
            success: 'متشکریم! نظر شما ارسال شد و پس از تأیید نمایش داده خواهد شد.',
            alreadyReviewed: 'شما قبلاً به این محصول نظر داده‌اید'
        }
    };

    const t = labels[lang as keyof typeof labels] || labels.en;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    customerName,
                    customerEmail,
                    rating,
                    comment: comment.trim() || null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            setSuccess(true);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <p style={{ color: '#22c55e', margin: 0 }}>{t.success}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem'
        }}>
            <h3 style={{
                margin: '0 0 1.5rem',
                fontSize: '1.25rem',
                color: '#fff',
                fontWeight: '700'
            }}>
                ⭐ {t.title}
            </h3>

            {/* Star Rating */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                }}>
                    {t.rating}
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '2rem',
                                cursor: 'pointer',
                                color: (hoverRating || rating) >= star ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                                transition: 'transform 0.2s ease',
                                transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                }}>
                    {t.name} *
                </label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                }}>
                    {t.email} *
                </label>
                <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                }}>
                    {t.comment}
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem',
                        resize: 'vertical'
                    }}
                />
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    color: '#ef4444',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: loading ? '#666' : 'linear-gradient(135deg, #ff9800, #ff5722)',
                    border: 'none',
                    borderRadius: '50px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)'
                }}
            >
                {loading ? t.submitting : t.submit}
            </button>
        </form>
    );
}
