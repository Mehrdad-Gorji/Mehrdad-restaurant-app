
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/serialize';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const combo = await prisma.combo.findUnique({
        where: { id },
        include: {
            items: { include: { product: { include: { translations: true } } } },
            translations: true
        }
    });

    if (!combo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(serializePrisma(combo));
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { name, slug, description, price, discountType, discountValue, isActive, items, image, translations } = body;

        // Validation
        if (!name || !slug || price === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction to update basic info, items and translations
        const updated = await prisma.$transaction(async (tx) => {
            // 1. Update Combo Core
            const combo = await tx.combo.update({
                where: { id },
                data: {
                    name,
                    slug,
                    description,
                    price: Number(price),
                    discountType,
                    discountValue: Number(discountValue || 0),
                    isActive,
                    image
                }
            });

            // 2. Sync Items (Delete all and recreate)
            await tx.comboItem.deleteMany({ where: { comboId: id } });

            if (items && items.length > 0) {
                await tx.comboItem.createMany({
                    data: items.map((it: any) => ({
                        comboId: id,
                        productId: it.productId,
                        quantity: it.quantity ?? 1,
                        sizeName: it.sizeName,
                        extrasJson: it.extrasJson ? JSON.stringify(it.extrasJson) : null
                    }))
                });
            }

            // 3. Sync Translations (Delete all and recreate)
            await tx.comboTranslation.deleteMany({ where: { comboId: id } });

            if (translations && translations.length > 0) {
                await tx.comboTranslation.createMany({
                    data: translations.map((t: any) => ({
                        comboId: id,
                        language: t.language,
                        name: t.name,
                        description: t.description || null
                    }))
                });
            }

            return combo;
        });

        return NextResponse.json(serializePrisma(updated));
    } catch (error: any) {
        console.error('Update Combo Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // Delete related items first
        await prisma.comboItem.deleteMany({ where: { comboId: id } });
        // Then delete the combo
        await prisma.combo.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete combo error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
