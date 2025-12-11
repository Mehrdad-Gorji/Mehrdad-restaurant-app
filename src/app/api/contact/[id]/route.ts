import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // @ts-ignore
        const message = await prisma.contactMessage.findUnique({
            where: { id }
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json(message);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // @ts-ignore
        const message = await prisma.contactMessage.update({
            where: { id },
            data: {
                status: body.status,
                reply: body.reply,
                repliedAt: body.reply ? new Date() : undefined
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // @ts-ignore
        await prisma.contactMessage.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}
