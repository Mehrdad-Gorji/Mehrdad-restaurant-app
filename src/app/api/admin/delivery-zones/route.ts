import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { zipStart, zipEnd, price, name, minOrder, freeDeliveryOver, estimatedTime } = body;

        const zone = await prisma.deliveryZone.create({
            data: {
                zipStart,
                zipEnd,
                price: Number(price),
                name: name || null,
                minOrder: minOrder ? Number(minOrder) : null,
                freeDeliveryOver: freeDeliveryOver ? Number(freeDeliveryOver) : null,
                estimatedTime: estimatedTime || null
            }
        });
        return NextResponse.json(zone);
    } catch (error) {
        console.error('Create Zone Error:', error);
        return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, zipStart, zipEnd, price, name, minOrder, freeDeliveryOver, estimatedTime } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const zone = await prisma.deliveryZone.update({
            where: { id },
            data: {
                zipStart,
                zipEnd,
                price: Number(price),
                name: name || null,
                minOrder: minOrder ? Number(minOrder) : null,
                freeDeliveryOver: freeDeliveryOver ? Number(freeDeliveryOver) : null,
                estimatedTime: estimatedTime || null
            }
        });
        return NextResponse.json(zone);
    } catch (error) {
        console.error('Update Zone Error:', error);
        return NextResponse.json({ error: 'Failed to update zone' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.deliveryZone.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete zone' }, { status: 500 });
    }
}
