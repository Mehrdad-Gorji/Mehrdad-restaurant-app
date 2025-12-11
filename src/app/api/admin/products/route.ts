import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            slug,
            price,
            image, // Add image
            categoryId,
            translations,
            sizes,
            extras,
            isSpicy,
            isVegetarian,
            isGlutenFree,
            isVegan,
            isFeatured,
            isTrending
        } = body;

        // ...

        const createdProduct = await prisma.product.create({
            data: {
                slug,
                price: Number(price),
                image: image || null,
                categoryId,
                isSpicy: isSpicy || false,
                isVegetarian: isVegetarian || false,
                isGlutenFree: isGlutenFree || false,
                isVegan: isVegan || false,
                isFeatured: isFeatured || false,
                isTrending: isTrending || false,
                translations: {
                    create: translations.map((t: any) => ({
                        language: t.language,
                        name: t.name,
                        description: t.description || ''
                    }))
                },
                sizes: sizes ? {
                    create: sizes.map((size: any) => ({
                        priceModifier: size.priceModifier,
                        translations: {
                            create: size.translations
                        }
                    }))
                } : undefined,
                extras: extras ? {
                    create: extras.map((extraId: string) => ({
                        extraId: extraId
                    }))
                } : undefined
            }
        });

        return NextResponse.json(createdProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
