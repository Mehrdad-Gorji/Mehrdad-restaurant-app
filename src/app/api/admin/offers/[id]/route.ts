import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// PUT: Update an offer
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, image, discountCode, isActive, startDate, endDate, translations } = body;

        // Transaction to handle translations update
        const offer = await prisma.$transaction(async (tx) => {
            // Update base fields
            const updated = await tx.offer.update({
                where: { id },
                data: {
                    title,
                    description,
                    image,
                    discountCode,
                    isActive,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                }
            });

            // Update translations if provided
            if (translations && Array.isArray(translations)) {
                // Delete existing (simplest strategy for full update) or upsert
                await tx.offerTranslation.deleteMany({ where: { offerId: id } });
                await tx.offerTranslation.createMany({
                    data: translations.map((t: any) => ({
                        offerId: id,
                        language: t.language,
                        title: t.title,
                        description: t.description
                    }))
                });
            }

            return updated;
        });

        revalidatePath('/[lang]/offers');
        return NextResponse.json(offer);
    } catch (error) {
        console.error('Error updating offer:', error);
        return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
    }
}

// DELETE: Remove an offer
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.offer.delete({ where: { id } });

        revalidatePath('/[lang]/offers');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting offer:', error);
        return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
    }
}
