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

        // Fetch estimatedMinutes, confirmedAt, and completedAt for each order using raw query
        // This ensures we get these fields even if Prisma client wasn't regenerated
        const orderTimes = await prisma.$queryRaw<any[]>`
            SELECT id, "estimatedMinutes", "confirmedAt", "completedAt" FROM "Order"
        `;

        // Create a map for quick lookup
        const timeMap = new Map();
        for (const ot of orderTimes) {
            timeMap.set(ot.id, {
                estimatedMinutes: ot.estimatedMinutes,
                confirmedAt: ot.confirmedAt,
                completedAt: ot.completedAt
            });
        }

        // Merge the time data into orders
        const ordersWithTime = orders.map((order: any) => {
            const timeData = timeMap.get(order.id) || {};
            return {
                ...order,
                estimatedMinutes: timeData.estimatedMinutes ?? null,
                confirmedAt: timeData.confirmedAt ?? null,
                completedAt: timeData.completedAt ?? null
            };
        });

        return NextResponse.json(serializePrisma(ordersWithTime));
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
