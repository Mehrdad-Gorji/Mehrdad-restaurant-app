import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
    const admin = await getAdminSession();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { orderId, estimatedMinutes } = await request.json();

        if (!orderId || !estimatedMinutes) {
            return NextResponse.json({ error: 'Missing orderId or estimatedMinutes' }, { status: 400 });
        }

        // Use raw query to update since Prisma client might not have new fields yet
        await prisma.$executeRaw`
            UPDATE "Order" 
            SET "estimatedMinutes" = ${estimatedMinutes}, 
                "confirmedAt" = ${new Date().toISOString()}, 
                "status" = 'PREPARING',
                "updatedAt" = ${new Date().toISOString()}
            WHERE "id" = ${orderId}
        `;

        // Fetch and return updated order
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Failed to set estimate:', error);
        return NextResponse.json({ error: 'Failed to set estimate', details: String(error) }, { status: 500 });
    }
}
