import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Parse to JSON
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Empty file' }, { status: 400 });
        }

        let imported = 0;
        let errors: string[] = [];

        for (const row of rows) {
            try {
                const slug = row.slug?.toString().trim();
                if (!slug) {
                    errors.push(`Row missing slug`);
                    continue;
                }

                // Find or create category by English name
                const categoryName = row.category_en?.toString().trim() || 'Uncategorized';
                let category = await prisma.category.findFirst({
                    where: {
                        translations: {
                            some: {
                                language: 'en',
                                name: categoryName
                            }
                        }
                    }
                });

                if (!category) {
                    // Create new category with slug
                    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    category = await prisma.category.create({
                        data: {
                            slug: categorySlug,
                            translations: {
                                create: [
                                    { language: 'en', name: categoryName, description: '' },
                                    { language: 'sv', name: row.category_sv || categoryName, description: '' },
                                    { language: 'fa', name: categoryName, description: '' },
                                    { language: 'de', name: categoryName, description: '' }
                                ]
                            }
                        }
                    });
                }

                // Check if product exists
                const existingProduct = await prisma.product.findUnique({
                    where: { slug }
                });

                const productData = {
                    price: parseFloat(row.price) || 0,
                    image: row.image || null,
                    categoryId: category.id,
                    isSpicy: row.isSpicy?.toString().toUpperCase() === 'YES',
                    isVegetarian: row.isVegetarian?.toString().toUpperCase() === 'YES',
                    isGlutenFree: row.isGlutenFree?.toString().toUpperCase() === 'YES',
                    isVegan: row.isVegan?.toString().toUpperCase() === 'YES',
                    isFeatured: row.isFeatured?.toString().toUpperCase() === 'YES',
                    isTrending: row.isTrending?.toString().toUpperCase() === 'YES',
                };

                const languages = ['en', 'sv', 'fa', 'de'];

                if (existingProduct) {
                    // Update existing product
                    await prisma.product.update({
                        where: { id: existingProduct.id },
                        data: productData
                    });

                    // Update translations
                    for (const lang of languages) {
                        const name = row[`name_${lang}`]?.toString() || '';
                        const desc = row[`desc_${lang}`]?.toString() || '';

                        if (name) {
                            await prisma.productTranslation.upsert({
                                where: {
                                    productId_language: {
                                        productId: existingProduct.id,
                                        language: lang
                                    }
                                },
                                update: { name, description: desc },
                                create: {
                                    productId: existingProduct.id,
                                    language: lang,
                                    name,
                                    description: desc
                                }
                            });
                        }
                    }
                } else {
                    // Create new product
                    const translationsData = languages
                        .filter(lang => row[`name_${lang}`])
                        .map(lang => ({
                            language: lang,
                            name: row[`name_${lang}`]?.toString() || slug,
                            description: row[`desc_${lang}`]?.toString() || ''
                        }));

                    await prisma.product.create({
                        data: {
                            slug,
                            ...productData,
                            translations: {
                                create: translationsData.length > 0 ? translationsData : [
                                    { language: 'en', name: slug, description: '' }
                                ]
                            }
                        }
                    });
                }

                imported++;
            } catch (rowError: any) {
                errors.push(`Error on slug "${row.slug}": ${rowError.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            total: rows.length,
            errors: errors.slice(0, 10) // Return first 10 errors max
        });

    } catch (error: any) {
        console.error('Import Error:', error);
        return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
    }
}
