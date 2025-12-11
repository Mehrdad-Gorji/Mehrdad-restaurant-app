import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, items = [], deliveryFee = 0, userId } = body;

        if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
            include: { allowedProducts: true }
        });

        if (!coupon) {
            return NextResponse.json({ valid: false, message: 'Invalid coupon' }, { status: 404 });
        }

        const now = new Date();

        if (!coupon.isActive) {
            return NextResponse.json({ valid: false, message: 'Coupon is not active' }, { status: 400 });
        }

        if (coupon.startDate && now < new Date(coupon.startDate)) {
            return NextResponse.json({ valid: false, message: 'Coupon is not active yet' }, { status: 400 });
        }

        if (coupon.endDate && now > new Date(coupon.endDate)) {
            return NextResponse.json({ valid: false, message: 'Coupon expired' }, { status: 400 });
        }

        // Calculate total from items to ensure accuracy
        const itemsTotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) * (item.quantity || 1)), 0);
        const total = itemsTotal + Number(deliveryFee);

        if (coupon.minAmount && total < Number(coupon.minAmount)) {
            return NextResponse.json({ valid: false, message: 'Minimum order amount is ' + coupon.minAmount + ' SEK' }, { status: 400 });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ valid: false, message: 'Coupon usage limit reached' }, { status: 400 });
        }

        // Enforce per-user usage limit when userId is provided
        if (userId && coupon.maxUsesPerUser) {
            const userUses = await prisma.order.count({ where: { couponCode: coupon.code, userId } });
            if (userUses >= coupon.maxUsesPerUser) {
                return NextResponse.json({ valid: false, message: 'You have reached the usage limit for this coupon' }, { status: 400 });
            }
        }

        let discount = 0;
        let baseAmount = 0;

        // Determine Base Amount
        const applyTo = coupon.applyTo || 'total';

        if (applyTo === 'shipping') {
            baseAmount = Number(deliveryFee);
        } else if (coupon.allowedProducts.length > 0) {
            // Filter items that match allowed products
            const allowedProductIds = new Set(coupon.allowedProducts.map(p => p.id));
            const eligibleItems = items.filter((item: any) => allowedProductIds.has(item.productId));

            if (eligibleItems.length === 0) {
                return NextResponse.json({ valid: false, message: 'Coupon not applicable to items in cart' }, { status: 400 });
            }

            // Sum up price of eligible items
            baseAmount = eligibleItems.reduce((sum: number, item: any) => sum + (Number(item.price) * (item.quantity || 1)), 0);
        } else if (applyTo === 'items') {
            baseAmount = itemsTotal;
        } else {
            baseAmount = total;
        }

        // Calculate Discount
        if (coupon.type === 'PERCENTAGE') {
            discount = baseAmount * (Number(coupon.value) / 100);
        } else {
            // FIXED coupon value applies to the selected target
            discount = Number(coupon.value);
        }

        // Apply maxDiscount cap when present
        if (coupon.maxDiscount) {
            discount = Math.min(discount, Number(coupon.maxDiscount));
        }

        // Ensure discount doesn't exceed baseAmount
        discount = Math.min(discount, baseAmount);

        return NextResponse.json({
            valid: true,
            discount,
            type: coupon.type,
            value: coupon.value,
            code: coupon.code,
            usedCount: coupon.usedCount,
            maxUses: coupon.maxUses,
            maxUsesPerUser: coupon.maxUsesPerUser
        });

    } catch (error) {
        console.error('Coupon check error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
