import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json({ addresses: [] });
        }

        const addresses = await prisma.address.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({ addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        return NextResponse.json({ addresses: [] });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user already has 2 addresses
        const count = await prisma.address.count({ where: { userId: user.id } });
        if (count >= 2) {
            return NextResponse.json({ error: 'Maximum 2 addresses allowed' }, { status: 400 });
        }

        const body = await request.json();
        const { street, city, zipCode, floor, doorCode } = body;

        if (!street || !city || !zipCode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const address = await prisma.address.create({
            data: {
                userId: user.id,
                street,
                city,
                zipCode,
                floor: floor || null,
                doorCode: doorCode || null
            }
        });

        return NextResponse.json({ address });
    } catch (error) {
        console.error('Create address error:', error);
        return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }
}
