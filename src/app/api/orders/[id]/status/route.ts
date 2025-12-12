import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    try {
        const result = await prisma.order.findUnique({
            where: { id },
            select: {
                status: true,
                estimatedMinutes: true,
                confirmedAt: true
            }
        });

        if (!result) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: result.status,
            estimatedMinutes: result.estimatedMinutes,
            confirmedAt: result.confirmedAt
        });
    } catch (error) {
        console.error('Failed to fetch order status:', error);
        return NextResponse.json({ error: 'Failed to fetch order status' }, { status: 500 });
    }
}
