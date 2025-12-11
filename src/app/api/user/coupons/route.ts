import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // In a real app, you'd get the user ID from the session/token here.
        // For now, we'll accept a userId query param for simplicity/consistency with existing patterns here,
        // or check auth cookie if available. Ideally, this should be secure.
        // Assuming we pass userId as query param based on current checkout-form patterns or use a separate auth check.
        // Let's use the userId query param pattern for now as seen in other routes, but ideally use session.

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ coupons: [] });
        }

        const now = new Date();

        const coupons = await prisma.coupon.findMany({
            where: {
                allowedUsers: {
                    some: { id: userId }
                },
                isActive: true,
                AND: [
                    { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                    { OR: [{ endDate: null }, { endDate: { gte: now } }] }
                ]
            },
            include: {
                allowedProducts: {
                    select: { id: true, slug: true, translations: true } // Fetch minimized product data
                }
            }
        });

        // Filter out coupons that have reached global max uses
        // and check per-user limits
        const validCoupons = [];

        for (const coupon of coupons) {
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) continue;

            if (coupon.maxUsesPerUser) {
                const userUses = await prisma.order.count({
                    where: { couponCode: coupon.code, userId }
                });
                if (userUses >= coupon.maxUsesPerUser) continue;
            }

            validCoupons.push({
                code: coupon.code,
                value: coupon.value,
                type: coupon.type,
                minAmount: coupon.minAmount,
                desc: coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `${coupon.value} SEK OFF`,
                products: coupon.allowedProducts.length > 0 ? coupon.allowedProducts.map(p => p.translations[0]?.name || p.slug) : []
            });
        }

        return NextResponse.json({ coupons: validCoupons });

    } catch (error) {
        console.error('Error fetching user coupons:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
