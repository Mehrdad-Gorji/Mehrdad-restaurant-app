import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { street, city, zipCode, floor, doorCode } = body;

        // Verify ownership
        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const address = await prisma.address.update({
            where: { id },
            data: {
                street,
                city,
                zipCode,
                floor: floor || null,
                doorCode: doorCode || null
            }
        });

        return NextResponse.json({ address });
    } catch (error) {
        console.error('Update address error:', error);
        return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await prisma.address.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete address error:', error);
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
    }
}
