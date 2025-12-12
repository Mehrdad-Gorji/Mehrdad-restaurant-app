import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCategories } from '@/lib/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'sv';

    const categories = await getCategories(lang);
    return NextResponse.json(categories);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slug, nameEn, nameSv, nameDe, nameFa, image } = body;

        // Basic validation
        if (!slug || !nameEn) {
            return NextResponse.json({ error: 'Missing slug or English name' }, { status: 400 });
        }

        // Check for duplicate slug
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: `A category with slug "${slug}" already exists` }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                slug,
                image: image || null,
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

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Create category error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, image, nameEn, nameSv, nameDe, nameFa } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
        }

        // Update category image
        const category = await prisma.category.update({
            where: { id },
            data: { image: image || null }
        });

        // Update translations if provided
        if (nameEn || nameSv || nameDe || nameFa) {
            const languages = [
                { language: 'en', name: nameEn },
                { language: 'sv', name: nameSv },
                { language: 'de', name: nameDe },
                { language: 'fa', name: nameFa }
            ].filter(t => t.name);

            for (const t of languages) {
                await prisma.categoryTranslation.upsert({
                    where: { categoryId_language: { categoryId: id, language: t.language } },
                    update: { name: t.name },
                    create: { categoryId: id, language: t.language, name: t.name }
                });
            }
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        // Check if category has products
        const productCount = await prisma.product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return NextResponse.json({
                error: `Cannot delete: This category has ${productCount} product(s). Move or delete them first.`
            }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Delete translations
            await tx.categoryTranslation.deleteMany({ where: { categoryId: id } });
            // Delete category
            await tx.category.delete({ where: { id } });
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete category error:', error);
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
