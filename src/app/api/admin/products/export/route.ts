import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
    try {
        // Fetch all products with translations and category
        const products = await prisma.product.findMany({
            include: {
                translations: true,
                category: {
                    include: {
                        translations: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Flatten data for Excel
        const rows = products.map(product => {
            const getTranslation = (lang: string) =>
                product.translations.find(t => t.language === lang);
            const getCategoryName = (lang: string) =>
                product.category.translations.find(t => t.language === lang)?.name || '';

            return {
                slug: product.slug,
                price: Number(product.price),
                category_en: getCategoryName('en'),
                category_sv: getCategoryName('sv'),
                image: product.image || '',
                name_en: getTranslation('en')?.name || '',
                desc_en: getTranslation('en')?.description || '',
                name_sv: getTranslation('sv')?.name || '',
                desc_sv: getTranslation('sv')?.description || '',
                name_fa: getTranslation('fa')?.name || '',
                desc_fa: getTranslation('fa')?.description || '',
                name_de: getTranslation('de')?.name || '',
                desc_de: getTranslation('de')?.description || '',
                isSpicy: product.isSpicy ? 'YES' : 'NO',
                isVegetarian: product.isVegetarian ? 'YES' : 'NO',
                isGlutenFree: product.isGlutenFree ? 'YES' : 'NO',
                isVegan: product.isVegan ? 'YES' : 'NO',
                isFeatured: product.isFeatured ? 'YES' : 'NO',
                isTrending: product.isTrending ? 'YES' : 'NO',
            };
        });

        // Create workbook
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Return as downloadable file
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="products_export.xlsx"'
            }
        });

    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
