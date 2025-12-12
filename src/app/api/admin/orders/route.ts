import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { serializePrisma } from '@/lib/serialize';

export async function GET() {
    const admin = await getAdminSession();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch orders with all fields including estimatedMinutes and confirmedAt
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                items: {
                    include: {
                        product: {
                            include: { translations: true }
                        },
                        combo: {
                            include: { translations: true }
                        },
                        extras: {
                            include: {
                                extra: { include: { translations: true } }
                            }
                        }
                    }
                }
            }
        });



        return NextResponse.json(serializePrisma(orders));
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
