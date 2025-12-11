import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
    const admin = await getAdminSession();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { orderId, estimatedMinutes } = body;

        console.log("⏱️ Setting estimate for order:", orderId, "Minutes:", estimatedMinutes);

        if (!orderId || !estimatedMinutes) {
            console.error("❌ Missing params:", { orderId, estimatedMinutes });
            return NextResponse.json({ error: 'Missing orderId or estimatedMinutes' }, { status: 400 });
        }

        // Use Prisma update instead of raw query for safety
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                estimatedMinutes: Number(estimatedMinutes),
                confirmedAt: new Date(),
                status: 'PREPARING',
            }
        });

        console.log("✅ Estimate updated for order:", order.id);
        return NextResponse.json(order);
    } catch (error) {
        console.error('❌ Failed to set estimate:', error);
        return NextResponse.json({ error: 'Failed to set estimate', details: String(error) }, { status: 500 });
    }
}
