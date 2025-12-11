import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        const user = await getSessionUser();

        // Save contact message to database
        // @ts-ignore - ContactMessage model
        const contact = await prisma.contactMessage.create({
            data: {
                userId: user?.id,
                name,
                email,
                phone: phone || null,
                subject: subject || 'general',
                message,
                status: 'NEW'
            }
        });

        // Here you could also send an email notification
        // For now, we just save to database

        return NextResponse.json({
            success: true,
            message: 'Message received successfully',
            id: contact.id
        });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Failed to save message' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // @ts-ignore
        const messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json([]);
    }
}
