import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        let imported = 0;
        const languages = ['en', 'sv', 'fa', 'de'];

        for (const row of rows) {
            const slug = row.slug?.toString().trim();
            if (!slug) continue;

            const price = parseFloat(row.price) || 0;
            const discountType = row.discountType?.toString() || null;
            const discountValue = row.discountValue ? parseFloat(row.discountValue) : null;
            const image = row.image?.toString() || null;

            // Parse product slugs
            const productSlugs = row.products?.toString().split(',').map((s: string) => s.trim()).filter(Boolean) || [];

            const existing = await prisma.combo.findUnique({ where: { slug } });

            if (existing) {
                // Update existing combo
                await prisma.combo.update({
                    where: { id: existing.id },
                    data: { price, discountType, discountValue, image }
                });

                // Update translations
                for (const lang of languages) {
                    const name = row[`name_${lang}`]?.toString();
                    if (name) {
                        await prisma.comboTranslation.upsert({
                            where: { comboId_language: { comboId: existing.id, language: lang } },
                            update: { name, description: row[`desc_${lang}`] || '' },
                            create: { comboId: existing.id, language: lang, name, description: row[`desc_${lang}`] || '' }
                        });
                    }
                }

                // Update combo items if products provided
                if (productSlugs.length > 0) {
                    // Remove old items
                    await prisma.comboItem.deleteMany({ where: { comboId: existing.id } });

                    // Add new items
                    for (const productSlug of productSlugs) {
                        const product = await prisma.product.findUnique({ where: { slug: productSlug } });
                        if (product) {
                            await prisma.comboItem.create({
                                data: { comboId: existing.id, productId: product.id, quantity: 1 }
                            });
                        }
                    }
                }

                imported++;
            } else {
                // Create new combo
                const translations = languages
                    .filter(lang => row[`name_${lang}`])
                    .map(lang => ({
                        language: lang,
                        name: row[`name_${lang}`]?.toString() || slug,
                        description: row[`desc_${lang}`]?.toString() || ''
                    }));

                const newCombo = await prisma.combo.create({
                    data: {
                        slug,
                        name: row.name_en?.toString() || slug,
                        price,
                        discountType,
                        discountValue,
                        image,
                        translations: {
                            create: translations.length > 0 ? translations : [{ language: 'en', name: slug, description: '' }]
                        }
                    }
                });

                // Add combo items
                for (const productSlug of productSlugs) {
                    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
                    if (product) {
                        await prisma.comboItem.create({
                            data: { comboId: newCombo.id, productId: product.id, quantity: 1 }
                        });
                    }
                }

                imported++;
            }
        }

        return NextResponse.json({ success: true, imported, total: rows.length });
    } catch (error: any) {
        console.error('Import Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
