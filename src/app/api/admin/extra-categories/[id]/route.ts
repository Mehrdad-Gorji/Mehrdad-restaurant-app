import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { nameEn, nameSv, nameDe, nameFa } = body;

        // Delete existing translations and re-create them for simplicity, or upsert
        await prisma.extraCategoryTranslation.deleteMany({
            where: { extraCategoryId: id }
        });

        const updated = await prisma.extraCategory.update({
            where: { id },
            data: {
                translations: {
                    create: [
                        { language: 'en', name: nameEn },
                        { language: 'sv', name: nameSv || nameEn },
                        { language: 'de', name: nameDe || nameEn },
                        { language: 'fa', name: nameFa || nameEn },
                    ]
                }
            },
            include: { translations: true }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        // Disconnect extras from this category first
        await prisma.extra.updateMany({
            where: { categoryId: id },
            data: { categoryId: null }
        });

        await prisma.extraCategoryTranslation.deleteMany({
            where: { extraCategoryId: id }
        });

        await prisma.extraCategory.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
