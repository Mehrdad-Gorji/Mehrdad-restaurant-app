import { prisma } from '@/lib/prisma';
import { checkAndAssignRewards } from '@/lib/rewards';
import { NextRequest, NextResponse } from 'next/server';
import { isShopOpen } from '@/lib/shop-status';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            items,
            customer, // { name, phone, email }
            deliveryMethod, // 'DELIVERY', 'PICKUP'
            address, // { street, city, zip, floor, door }
            paymentMethod, // 'SWISH', 'CARD'
            total, // Frontend calculated total
            couponCode,
            userId,
            tip // Driver tip amount
        } = body;

        // Basic validation
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }
        if (!customer || !customer.name || !customer.phone) {
            return NextResponse.json({ error: 'Missing customer info' }, { status: 400 });
        }
        if (deliveryMethod === 'DELIVERY' && (!address || !address.street || !address.zip)) {
            return NextResponse.json({ error: 'Missing address' }, { status: 400 });
        }

        if (Number(total) <= 0) {
            return NextResponse.json({ error: 'Invalid total' }, { status: 400 });
        }

        // Validate Shop Status
        const settings = await prisma.siteSettings.findFirst();
        if (settings) {
            const status = isShopOpen(settings.operatingSchedule, settings.scheduleEnabled ?? false);
            if (!status.isOpen) {
                return NextResponse.json({
                    error: `Store is closed. ${status.message}`
                }, { status: 400 });
            }
        }

        // If coupon provided, increment usage count
        if (couponCode) {
            await prisma.coupon.update({
                where: { code: couponCode.toUpperCase() },
                data: { usedCount: { increment: 1 } }
            }).catch(() => { });
        }

        const newOrder = await prisma.order.create({
            data: {
                total: total,
                status: 'PENDING',
                deliveryMethod,
                deliveryFee: deliveryMethod === 'DELIVERY' ? 50 : 0,
                addressJson: JSON.stringify({
                    ...(address || {}),
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email
                }),
                couponCode: couponCode ? couponCode.toUpperCase() : null,
                userId: userId || null,
                tip: tip || 0, // Store tip amount

                // Scheduling
                isScheduled: body.isScheduled || false,
                requestedTime: body.requestedTime ? new Date(body.requestedTime) : null,
            },
        });

        // Store items
        for (const item of items) {
            // Filter out extras without valid IDs
            const candidateExtras = (item.extras || []).filter((e: any) => e && e.id);

            // Validate that productId or comboId exists in database
            const productId = item.isCombo ? null : item.productId;
            const comboId = item.isCombo ? item.productId : null;

            // Skip if productId is invalid for non-combo items
            if (!item.isCombo && productId) {
                const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
                if (!exists) {
                    console.error('Product not found:', productId);
                    continue; // Skip this item instead of failing
                }
            }

            // Validate extras exist in database
            const validExtras: { id: string; name: string; price: number }[] = [];
            for (const e of candidateExtras) {
                const extraExists = await prisma.extra.findUnique({ where: { id: e.id }, select: { id: true } });
                if (extraExists) {
                    validExtras.push({ id: e.id, name: e.name || 'Extra', price: e.price || 0 });
                } else {
                    console.error('Extra not found, skipping:', e.id);
                }
            }

            await prisma.orderItem.create({
                data: {
                    orderId: newOrder.id,
                    productId: productId,
                    comboId: comboId,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.sizeName,
                    extras: validExtras.length > 0 ? {
                        create: validExtras.map((e) => ({
                            extraId: e.id,
                            name: e.name,
                            price: e.price
                        }))
                    } : undefined
                }
            });
        }

        await prisma.payment.create({
            data: {
                orderId: newOrder.id,
                amount: total,
                method: paymentMethod,
                status: 'COMPLETED',
                provider: 'MockProvider'
            }
        });

        await prisma.order.update({
            where: { id: newOrder.id },
            data: { status: 'PAID' }
        });

        // Check and assign reward coupons if user qualifies
        if (userId) {
            checkAndAssignRewards(userId).catch(err => console.error('Reward check error:', err));
        }

        return NextResponse.json({ success: true, orderId: newOrder.id });

    } catch (error) {
        console.error('Submit order error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
