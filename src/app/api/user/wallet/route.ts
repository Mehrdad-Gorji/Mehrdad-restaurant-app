import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get or create wallet
        let wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: {
                    userId: user.id,
                    balance: 0
                },
                include: {
                    transactions: true
                }
            });
        }

        return NextResponse.json(wallet);
    } catch (error) {
        console.error('Wallet fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
