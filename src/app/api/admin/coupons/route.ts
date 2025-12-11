import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, type, value, minAmount, maxUses, maxUsesPerUser, startDate, endDate, isActive, appliedProductIds, appliedUserIds, createOffer, description, design } = body;

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                type, // PERCENTAGE or FIXED
                value: Number(value),
                minAmount: minAmount ? Number(minAmount) : null,
                maxUses: maxUses ? Number(maxUses) : null,
                maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : 1,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                isActive: typeof isActive === 'undefined' ? true : Boolean(isActive),
                design: design || 'TICKET',
                allowedProducts: appliedProductIds && appliedProductIds.length > 0 ? {
                    connect: appliedProductIds.map((id: string) => ({ id }))
                } : undefined,
                allowedUsers: appliedUserIds && appliedUserIds.length > 0 ? {
                    connect: appliedUserIds.map((id: string) => ({ id }))
                } : undefined
            }
        });

        // Auto-create Offer if requested
        if (createOffer) {
            await prisma.offer.create({
                data: {
                    title: `Special Deal: ${code.toUpperCase()}`,
                    description: description || `Get ${value}${type === 'PERCENTAGE' ? '%' : ' SEK'} off with code ${code.toUpperCase()}`,
                    discountCode: coupon.code,
                    startDate: coupon.startDate,
                    endDate: coupon.endDate,
                    isActive: true,
                    translations: {
                        create: [
                            { language: 'en', title: `Special Deal: ${code.toUpperCase()}`, description: description || `Get ${value}${type === 'PERCENTAGE' ? '%' : ' SEK'} off` },
                            { language: 'sv', title: `Erbjudande: ${code.toUpperCase()}`, description: description || `Få ${value}${type === 'PERCENTAGE' ? '%' : ' kr'} rabatt` }
                        ]
                    }
                }
            });
        }

        return NextResponse.json(coupon);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.coupon.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data: any = {};
        if (body.code) data.code = String(body.code).toUpperCase();
        if (body.type) data.type = body.type;
        if (typeof body.value !== 'undefined') data.value = Number(body.value);
        if (typeof body.minAmount !== 'undefined') data.minAmount = body.minAmount === null ? null : Number(body.minAmount);
        if (typeof body.maxUses !== 'undefined') data.maxUses = body.maxUses === null ? null : Number(body.maxUses);
        if (typeof body.maxUsesPerUser !== 'undefined') data.maxUsesPerUser = Number(body.maxUsesPerUser);
        if (typeof body.isActive !== 'undefined') data.isActive = Boolean(body.isActive);
        if (typeof body.startDate !== 'undefined') data.startDate = body.startDate ? new Date(body.startDate) : null;
        if (typeof body.endDate !== 'undefined') data.endDate = body.endDate ? new Date(body.endDate) : null;
        if (body.design) data.design = body.design;

        // Handle product and user relations
        if (body.appliedProductIds) {
            data.allowedProducts = {
                set: body.appliedProductIds.map((id: string) => ({ id }))
            };
        }
        if (body.appliedUserIds) {
            data.allowedUsers = {
                set: body.appliedUserIds.map((id: string) => ({ id }))
            };
        }

        const updated = await prisma.coupon.update({ where: { id }, data });
        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }
}
