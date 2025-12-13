import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const admin = await getAdminSession();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const count = await prisma.contactMessage.count({
            where: {
                status: 'NEW'
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Failed to fetch message count:', error);
        return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
    }
}
