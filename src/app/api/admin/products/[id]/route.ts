import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { slug, price, image, categoryId, translations, sizes, extras, isSpicy, isVegetarian, isGlutenFree, isVegan, isFeatured, isTrending } = body;

        // Transaction to update all related data
        await prisma.$transaction(async (tx: any) => {
            // Update basic info
            await tx.product.update({
                where: { id },
                data: {
                    slug,
                    price: Number(price),
                    image,
                    categoryId,
                    isSpicy: isSpicy || false,
                    isVegetarian: isVegetarian || false,
                    isGlutenFree: isGlutenFree || false,
                    isVegan: isVegan || false,
                    isFeatured: isFeatured || false,
                    isTrending: isTrending || false
                }
            });

            // Update translations (simple approach: delete all and recreate)
            await tx.productTranslation.deleteMany({ where: { productId: id } });
            await tx.productTranslation.createMany({
                data: translations.map((t: any) => ({
                    productId: id,
                    language: t.language,
                    name: t.name,
                    description: t.description || ''
                }))
            });

            // Update extras (delete and recreate links)
            if (extras) {
                await tx.productExtra.deleteMany({ where: { productId: id } });
                await tx.productExtra.createMany({
                    data: extras.map((eId: string) => ({
                        productId: id,
                        extraId: eId
                    }))
                });
            }

            // Sizes: Simplification for MVP - if sizes provided, replace them
            if (sizes) {
                // Must delete size translations first to avoid FK constraint error
                const existingSizes = await tx.productSize.findMany({
                    where: { productId: id },
                    select: { id: true }
                });
                const sizeIds = existingSizes.map((s: any) => s.id);

                if (sizeIds.length > 0) {
                    await tx.productSizeTranslation.deleteMany({
                        where: { productSizeId: { in: sizeIds } }
                    });
                }

                await tx.productSize.deleteMany({ where: { productId: id } });

                for (const s of sizes) {
                    await tx.productSize.create({
                        data: {
                            productId: id,
                            priceModifier: Number(s.priceModifier), // Ensure number
                            translations: {
                                create: s.translations
                            }
                        }
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.$transaction(async (tx: any) => {
            // 1. Delete Product Translations
            await tx.productTranslation.deleteMany({ where: { productId: id } });

            // 2. Delete Product Extras relations
            await tx.productExtra.deleteMany({ where: { productId: id } });

            // 3. Delete Product Sizes and their translations
            const existingSizes = await tx.productSize.findMany({
                where: { productId: id },
                select: { id: true }
            });
            const sizeIds = existingSizes.map((s: any) => s.id);

            if (sizeIds.length > 0) {
                await tx.productSizeTranslation.deleteMany({
                    where: { productSizeId: { in: sizeIds } }
                });
                await tx.productSize.deleteMany({ where: { productId: id } });
            }

            // 4. Finally Delete the Product
            await tx.product.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
