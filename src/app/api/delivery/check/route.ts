import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');

    if (!zip) return NextResponse.json({ error: 'Zip required' }, { status: 400 });

    try {
        const zones = await prisma.deliveryZone.findMany();

        // Simple range check
        // Assuming zip codes are numeric or string comparable
        const matched = zones.find(z => {
            return zip >= z.zipStart && zip <= z.zipEnd;
        });

        if (matched) {
            return NextResponse.json({ available: true, price: Number(matched.price) });
        } else {
            return NextResponse.json({ available: false, price: 0 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
