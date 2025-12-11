import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET: List all offers
export async function GET(request: Request) {
    try {
        const offers = await prisma.offer.findMany({
            include: { translations: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}

// POST: Create a new offer
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, image, discountCode, isActive, startDate, endDate, translations } = body;

        // Create the offer
        const offer = await prisma.offer.create({
            data: {
                title,
                description,
                image,
                discountCode,
                isActive: isActive ?? true,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                translations: {
                    create: translations || [] // Expecting array of { language, title, description }
                }
            },
            include: { translations: true }
        });

        revalidatePath('/[lang]/offers'); // Revalidate the public page
        return NextResponse.json(offer);
    } catch (error) {
        console.error('Error creating offer:', error);
        return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
    }
}
