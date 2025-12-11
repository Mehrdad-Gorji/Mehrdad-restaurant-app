import { prisma } from '@/lib/prisma';

/**
 * Check if user qualifies for any reward rules and create coupons if they do
 */
export async function checkAndAssignRewards(userId: string) {
    if (!userId) return;

    try {
        // Get all active reward rules
        const rules = await prisma.rewardRule.findMany({
            where: { isActive: true }
        });

        // 1. Check for Order Count Milestones (Loyalty Program)
        const settings = await prisma.siteSettings.findFirst();

        // Count total completed/paid orders for this user
        const orderCount = await prisma.order.count({
            where: {
                userId,
                status: { in: ['PAID', 'PREPARING', 'COMPLETED', 'DELIVERING'] }
            }
        });

        // Current order triggered this, so if count is 1, they just finished their 1st order.
        // Reward for 2nd Order -> Send when count is 1.
        if (settings?.loyaltySecondOrderEnabled && orderCount === 1) {
            const existing = await prisma.coupon.findFirst({ where: { code: { startsWith: `LOYAL2_${userId.slice(0, 8)}` } } });
            if (!existing) {
                const code = `LOYAL2_${userId.slice(0, 8)}_${Date.now().toString(36).slice(-4).toUpperCase()}`;
                await prisma.coupon.create({
                    data: {
                        code,
                        type: settings.loyaltySecondOrderType || 'PERCENTAGE',
                        value: settings.loyaltySecondOrderValue || 10,
                        isActive: true,
                        maxUses: 1,
                        maxUsesPerUser: 1,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + (settings.loyaltySecondOrderDays || 30) * 24 * 60 * 60 * 1000),
                        allowedUsers: { connect: { id: userId } }
                    }
                });
                console.log(`[LOYALTY] Created 2nd Order Reward ${code} for user ${userId}`);
            }
        }

        // Reward for 3rd Order -> Send when count is 2.
        if (settings?.loyaltyThirdOrderEnabled && orderCount === 2) {
            const existing = await prisma.coupon.findFirst({ where: { code: { startsWith: `LOYAL3_${userId.slice(0, 8)}` } } });
            if (!existing) {
                const code = `LOYAL3_${userId.slice(0, 8)}_${Date.now().toString(36).slice(-4).toUpperCase()}`;
                await prisma.coupon.create({
                    data: {
                        code,
                        type: settings.loyaltyThirdOrderType || 'PERCENTAGE',
                        value: settings.loyaltyThirdOrderValue || 15,
                        isActive: true,
                        maxUses: 1,
                        maxUsesPerUser: 1,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + (settings.loyaltyThirdOrderDays || 30) * 24 * 60 * 60 * 1000),
                        allowedUsers: { connect: { id: userId } }
                    }
                });
                console.log(`[LOYALTY] Created 3rd Order Reward ${code} for user ${userId}`);
            }
        }

        // 2. Existing Spend-Based Rewards
        if (rules.length === 0) return;

        for (const rule of rules) {
            // Calculate the date range for this rule
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - rule.periodDays);

            // Calculate total spending for this user in the period
            const orders = await prisma.order.findMany({
                where: {
                    userId,
                    status: { in: ['PAID', 'PREPARING', 'COMPLETED'] }, // Only count completed/paid orders
                    createdAt: { gte: startDate }
                },
                select: { total: true }
            });

            const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);

            // Check if user meets the threshold
            if (totalSpent >= Number(rule.spendThreshold)) {
                // Check if we already gave a coupon for this rule in this period
                const existingCoupon = await prisma.coupon.findFirst({
                    where: {
                        code: { startsWith: `REWARD_${rule.id.slice(0, 8)}_${userId.slice(0, 8)}` },
                        startDate: { gte: startDate }
                    }
                });

                if (existingCoupon) {
                    // Already assigned a reward for this rule in this period
                    continue;
                }

                // Create a new coupon for this user
                const couponCode = `REWARD_${rule.id.slice(0, 8)}_${userId.slice(0, 8)}_${Date.now().toString(36).toUpperCase()}`;
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + rule.couponValidDays);

                await prisma.coupon.create({
                    data: {
                        code: couponCode,
                        type: rule.discountType,
                        value: rule.discountValue,
                        maxDiscount: rule.maxDiscount,
                        startDate: new Date(),
                        endDate,
                        maxUses: 1,
                        maxUsesPerUser: 1,
                        isActive: true,
                        allowedUsers: {
                            connect: { id: userId }
                        }
                    }
                });

                console.log(`[REWARD] Created reward coupon ${couponCode} for user ${userId} (spent ${totalSpent} SEK in ${rule.periodDays} days)`);
            }
        }
    } catch (error) {
        console.error('[REWARD] Error checking rewards:', error);
    }
}
