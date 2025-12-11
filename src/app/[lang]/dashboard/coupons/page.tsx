import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CouponCard from '@/components/coupon-card';

export default async function CouponsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const user = await getSessionUser();

    if (!user) {
        redirect(`/${lang}/login`);
    }

    // Fetch only coupons assigned specifically to this user
    const coupons = await prisma.coupon.findMany({
        where: {
            isActive: true,
            allowedUsers: {
                some: { id: user.id }
            },
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
            ]
        },
        orderBy: { value: 'desc' }
    });

    const validCoupons = [];

    for (const coupon of coupons) {
        // Check global limit
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) continue;

        // Check user limit
        if (coupon.maxUsesPerUser) {
            const userUses = await prisma.order.count({
                where: {
                    userId: user.id,
                    couponCode: coupon.code
                }
            });
            if (userUses >= coupon.maxUsesPerUser) continue;
        }

        validCoupons.push(coupon);
    }

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            position: 'relative',
            paddingTop: '2rem',
            paddingBottom: '4rem'
        }}>
            {/* Background Orbs */}
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                top: '-200px',
                left: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
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
                    <h1 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        🎟️ {lang === 'fa' ? 'کوپن‌های تخفیف' : 'Available Coupons'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                        {lang === 'fa' ? 'از این کوپن‌ها در صفحه پرداخت استفاده کنید' : 'Use these codes at checkout'}
                    </p>
                </div>

                {validCoupons.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '4rem 2rem',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🎫</span>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>
                            {lang === 'fa' ? 'کوپنی موجود نیست' : 'No coupons available'}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {lang === 'fa' ? 'به زودی کوپن‌های جدید اضافه می‌شود' : 'Check back soon for new offers'}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {validCoupons.map((coupon: any) => {
                            // Use assigned design or fallback to TICKET
                            const variant = (coupon.design as 'TICKET' | 'GLASS' | 'LUXE' | 'NEON') || 'TICKET';

                            // Transform Decimal to primitive numbers to avoid serialization error
                            const serializedCoupon = {
                                ...coupon,
                                value: Number(coupon.value),
                                minAmount: coupon.minAmount ? Number(coupon.minAmount) : null,
                                maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
                            };

                            return (
                                <CouponCard
                                    key={coupon.id}
                                    coupon={serializedCoupon}
                                    lang={lang}
                                    variant={variant}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
