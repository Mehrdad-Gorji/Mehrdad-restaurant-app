import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const extras = await prisma.extra.findMany({
        include: { translations: true }
    });
    return NextResponse.json(extras);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { price, image, nameEn, nameSv, nameDe, nameFa, categoryId } = body;

        // Basic validation
        if (!nameEn) {
            return NextResponse.json({ error: 'English name required' }, { status: 400 });
        }

        const extra = await prisma.extra.create({
            data: {
                price: Number(price) || 0,
                image: image || null,
                categoryId: categoryId || null,
                translations: {
                    create: [
                        { language: 'en', name: nameEn },
                        { language: 'sv', name: nameSv || nameEn },
                        { language: 'de', name: nameDe || nameEn },
                        { language: 'fa', name: nameFa || nameEn },
                    ]
                }
            }
        });

        return NextResponse.json(extra);
    } catch (error) {
        console.error('Create extra error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, price, image, nameEn, nameSv, nameDe, nameFa, categoryId } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const extra = await prisma.$transaction(async (tx) => {
            // 1. Update basic info
            const updatedExtra = await tx.extra.update({
                where: { id },
                data: {
                    price: Number(price) || 0,
                    image: image || null,
                    categoryId: categoryId || null
                }
            });

            // 2. Delete existing translations
            await tx.extraTranslation.deleteMany({
                where: { extraId: id }
            });

            // 3. Create new translations
            await tx.extraTranslation.createMany({
                data: [
                    { extraId: id, language: 'en', name: nameEn },
                    { extraId: id, language: 'sv', name: nameSv || nameEn },
                    { extraId: id, language: 'de', name: nameDe || nameEn },
                    { extraId: id, language: 'fa', name: nameFa || nameEn },
                ]
            });

            return updatedExtra;
        });

        return NextResponse.json(extra);
    } catch (error: any) {
        console.error('Update extra error:', error);
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Delete related records first
            await tx.orderItemExtra.deleteMany({ where: { extraId: id } });
            await tx.productExtra.deleteMany({ where: { extraId: id } });
            await tx.extraTranslation.deleteMany({ where: { extraId: id } });
            // Delete extra
            await tx.extra.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete extra error:', error);
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
