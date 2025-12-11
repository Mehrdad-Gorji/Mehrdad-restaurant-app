import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// POST /api/user/wallet/redeem
export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { pointsToRedeem } = body;

        if (!pointsToRedeem || pointsToRedeem <= 0) {
            return NextResponse.json({ error: 'Invalid points amount' }, { status: 400 });
        }

        // Fetch redemption settings
        const setting = await prisma.setting.findUnique({
            where: { key: 'loyalty_redemption_rate' }
        });
        // rate: how many currency units per 100 points. Default: 10 SEK per 100 points.
        const redemptionRate = setting ? Number(setting.value) : 10;

        // Calculate coupon value
        // Example: 200 points / 100 * 10 = 20 SEK
        const couponValue = (pointsToRedeem / 100) * redemptionRate;

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Wallet
            const wallet = await tx.wallet.findUnique({
                where: { userId: user.id }
            });

            if (!wallet || Number(wallet.balance) < pointsToRedeem) {
                throw new Error('Insufficient balance');
            }

            // 2. Create Coupon
            const code = `REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const coupon = await tx.coupon.create({
                data: {
                    code,
                    type: 'FIXED',
                    value: couponValue,
                    isActive: true,
                    maxUses: 1,
                    maxUsesPerUser: 1,
                    startDate: new Date(),
                    allowedUsers: {
                        connect: { id: user.id } // Exclusive to this user
                    },
                    design: 'TICKET' // Default design
                }
            });

            // 3. Debit Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        decrement: pointsToRedeem
                    }
                }
            });

            // 4. Log Transaction
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: pointsToRedeem,
                    type: 'DEBIT',
                    description: `Redeemed for ${couponValue} SEK coupon (${code})`
                }
            });

            return coupon;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Redemption error:', error);
        if (error.message === 'Insufficient balance') {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
