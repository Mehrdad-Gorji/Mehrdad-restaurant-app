import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const dataToUpdate: any = { status };
        let earnedPoints = 0;

        // Start transaction to update order and credit points atomically
        const result = await prisma.$transaction(async (tx) => {
            if (status === 'COMPLETED') {
                dataToUpdate.completedAt = new Date();

                // 1. Get original order to check user and total
                const order = await tx.order.findUnique({
                    where: { id },
                    select: { userId: true, total: true, status: true }
                });

                // Only credit if it wasn't already completed (prevent double dipping if status toggles)
                if (order && order.userId && order.status !== 'COMPLETED') {
                    // 2. Get Earn Rate (default: 10 currency = 1 point)
                    // Wait... plan said "10 points per 100 currency" -> 1 point per 10 currency.
                    // Let's make it configurable: "points_per_currency". Default to 1 for simplicity?
                    // Implementation plan said: "10 points per 100 currency units" -> 1 point per 10 units.
                    // Let's use `loyalty_earn_rate` as "Points per 1 unit of currency" or reverse.
                    // Easier: "Spend X to get 1 point".
                    // Let's assume standard: 1 Currency = 1 Point is too generous?
                    // Plan: "loyalty_earn_rate (int, e.g. 10 points per 100 currency)" -> 0.1 points per 1 currency.

                    const setting = await tx.setting.findUnique({ where: { key: 'loyalty_earn_rate' } });
                    const earnRate = setting ? Number(setting.value) : 10; // Default: 10 points per 100 currency (0.1) => Wait, if 10 is the stored value, we need to know what it means
                    // Let's define `loyalty_earn_rate` as: How many points you get for spending 100 units.
                    // So if total is 200, and rate is 10, points = (200 / 100) * 10 = 20.

                    earnedPoints = Math.floor((Number(order.total) / 100) * earnRate);

                    if (earnedPoints > 0) {
                        // 3. Upsert Wallet
                        const wallet = await tx.wallet.findUnique({ where: { userId: order.userId } });
                        if (wallet) {
                            await tx.wallet.update({
                                where: { id: wallet.id },
                                data: { balance: { increment: earnedPoints } }
                            });
                            await tx.walletTransaction.create({
                                data: {
                                    walletId: wallet.id,
                                    amount: earnedPoints,
                                    type: 'CREDIT',
                                    orderId: id,
                                    description: `Earned from Order #${id.substring(0, 8)}`
                                }
                            });
                        } else {
                            // Create wallet if not exists
                            await tx.wallet.create({
                                data: {
                                    userId: order.userId,
                                    balance: earnedPoints,
                                    transactions: {
                                        create: {
                                            amount: earnedPoints,
                                            type: 'CREDIT',
                                            orderId: id,
                                            description: `Earned from Order #${id.substring(0, 8)}`
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            }

            const updatedOrder = await tx.order.update({
                where: { id },
                data: dataToUpdate
            });

            return updatedOrder;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete related records first (due to foreign key constraints)
        await prisma.orderItemExtra.deleteMany({
            where: { orderItem: { orderId: id } }
        });

        await prisma.orderItem.deleteMany({
            where: { orderId: id }
        });

        await prisma.payment.deleteMany({
            where: { orderId: id }
        });

        // Delete the order
        await prisma.order.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
