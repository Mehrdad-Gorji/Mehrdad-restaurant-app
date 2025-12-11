import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    try {
        // Use raw query to get the new fields that might not be in Prisma client yet
        const result = await prisma.$queryRaw<any[]>`
            SELECT status, "estimatedMinutes", "confirmedAt" 
            FROM "Order" 
            WHERE id = ${id}
        `;

        if (!result || result.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: result[0].status,
            estimatedMinutes: result[0].estimatedMinutes,
            confirmedAt: result[0].confirmedAt
        });
    } catch (error) {
        console.error('Failed to fetch order status:', error);
        return NextResponse.json({ error: 'Failed to fetch order status' }, { status: 500 });
    }
}
