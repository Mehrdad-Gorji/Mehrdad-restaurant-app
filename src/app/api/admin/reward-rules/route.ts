import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const rules = await prisma.rewardRule.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(rules);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch reward rules' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, spendThreshold, periodDays, discountType, discountValue, maxDiscount, couponValidDays, isActive } = body;

        const rule = await prisma.rewardRule.create({
            data: {
                name,
                spendThreshold: Number(spendThreshold),
                periodDays: Number(periodDays),
                discountType,
                discountValue: Number(discountValue),
                maxDiscount: maxDiscount ? Number(maxDiscount) : null,
                couponValidDays: Number(couponValidDays) || 30,
                isActive: typeof isActive === 'undefined' ? true : Boolean(isActive)
            }
        });

        return NextResponse.json(rule);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create reward rule' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data: any = {};
        if (body.name) data.name = body.name;
        if (typeof body.spendThreshold !== 'undefined') data.spendThreshold = Number(body.spendThreshold);
        if (typeof body.periodDays !== 'undefined') data.periodDays = Number(body.periodDays);
        if (body.discountType) data.discountType = body.discountType;
        if (typeof body.discountValue !== 'undefined') data.discountValue = Number(body.discountValue);
        if (typeof body.maxDiscount !== 'undefined') data.maxDiscount = body.maxDiscount === null ? null : Number(body.maxDiscount);
        if (typeof body.couponValidDays !== 'undefined') data.couponValidDays = Number(body.couponValidDays);
        if (typeof body.isActive !== 'undefined') data.isActive = Boolean(body.isActive);

        const updated = await prisma.rewardRule.update({ where: { id }, data });
        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update reward rule' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.rewardRule.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
