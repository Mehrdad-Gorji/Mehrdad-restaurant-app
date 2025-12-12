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
            // Find or create Extra Category
            let categoryId: string | null = null;
            const categoryName = row.category_en?.toString().trim();

            if (categoryName) {
                let category = await prisma.extraCategory.findFirst({
                    where: { translations: { some: { language: 'en', name: categoryName } } }
                });

                if (!category) {
                    category = await prisma.extraCategory.create({
                        data: {
                            translations: {
                                create: [{ language: 'en', name: categoryName }]
                            }
                        }
                    });
                }
                categoryId = category.id;
            }

            const price = parseFloat(row.price) || 0;
            const image = row.image?.toString() || null;

            // Check if updating existing (by ID) or creating new
            const existingId = row.id?.toString().trim();

            if (existingId) {
                const existing = await prisma.extra.findUnique({ where: { id: existingId } });
                if (existing) {
                    await prisma.extra.update({
                        where: { id: existingId },
                        data: { price, image, categoryId }
                    });

                    for (const lang of languages) {
                        const name = row[`name_${lang}`]?.toString();
                        if (name) {
                            await prisma.extraTranslation.upsert({
                                where: { extraId_language: { extraId: existingId, language: lang } },
                                update: { name },
                                create: { extraId: existingId, language: lang, name }
                            });
                        }
                    }
                    imported++;
                    continue;
                }
            }

            // Create new extra
            const translations = languages
                .filter(lang => row[`name_${lang}`])
                .map(lang => ({ language: lang, name: row[`name_${lang}`]?.toString() || '' }));

            if (translations.length > 0) {
                await prisma.extra.create({
                    data: {
                        price,
                        image,
                        categoryId,
                        translations: { create: translations }
                    }
                });
                imported++;
            }
        }

        return NextResponse.json({ success: true, imported, total: rows.length });
    } catch (error: any) {
        console.error('Import Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
