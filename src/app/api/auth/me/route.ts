import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json({ user: null });
        }

        // Get additional data
        const [ordersCount, wallet, addresses] = await Promise.all([
            prisma.order.count({ where: { userId: user.id } }),
            prisma.wallet.findUnique({ where: { userId: user.id } }),
            prisma.address.findMany({ where: { userId: user.id } })
        ]);

        return NextResponse.json({
            user: {
                ...user,
                ordersCount,
                walletBalance: wallet?.balance ? Number(wallet.balance) : 0,
                addressesCount: addresses.length
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ user: null });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, phone } = body;

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: name || user.name,
                phone: phone || user.phone
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true
            }
        });

        return NextResponse.json({ user: updated });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
