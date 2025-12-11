import { prisma } from '@/lib/prisma';
import CouponManager from '@/components/admin/coupon-list';
import RewardRuleManager from '@/components/admin/reward-rule-manager';
import WelcomeCouponSettings from '@/components/admin/welcome-coupon-settings';
import LoyaltySettings from '@/components/admin/loyalty-settings';
import { serializePrisma } from '@/lib/serialize';

export default async function CouponsPage() {
    const coupons = await prisma.coupon.findMany({
        orderBy: { code: 'asc' },
        include: { allowedProducts: true, allowedUsers: true }
    });

    const products = await prisma.product.findMany({
        select: {
            id: true,
            slug: true,
            price: true,
            translations: { where: { language: 'en' }, select: { name: true } }
        }
    });

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            phone: true
        },
        orderBy: { name: 'asc' }
    });

    const rewardRules = await prisma.rewardRule.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const safeCoupons = serializePrisma(coupons);
    const safeProducts = serializePrisma(products);
    const safeUsers = serializePrisma(users);
    const safeRewardRules = serializePrisma(rewardRules);

    const activeCoupons = coupons.filter(c => c.isActive).length;

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
                    🎟️ Coupons & Rewards
                </h1>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    Manage discount codes, track usage, and create campaigns
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{coupons.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Coupons</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{activeCoupons}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Active</div>
                </div>
            </div>

            {/* Settings Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '1.5rem'
                }}>
                    <WelcomeCouponSettings />
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '1.5rem'
                }}>
                    <LoyaltySettings />
                </div>
            </div>

            {/* Coupon Manager */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <CouponManager initialCoupons={safeCoupons} availableProducts={safeProducts} availableUsers={safeUsers} />
            </div>

            {/* Reward Rules */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '1.5rem'
            }}>
                <RewardRuleManager initialRules={safeRewardRules} />
            </div>
        </div>
    );
}
