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

            const existing = await prisma.category.findUnique({ where: { slug } });

            if (existing) {
                for (const lang of languages) {
                    const name = row[`name_${lang}`]?.toString();
                    if (name) {
                        await prisma.categoryTranslation.upsert({
                            where: { categoryId_language: { categoryId: existing.id, language: lang } },
                            update: { name, description: row[`desc_${lang}`] || '' },
                            create: { categoryId: existing.id, language: lang, name, description: row[`desc_${lang}`] || '' }
                        });
                    }
                }
            } else {
                const translations = languages
                    .filter(lang => row[`name_${lang}`])
                    .map(lang => ({
                        language: lang,
                        name: row[`name_${lang}`]?.toString() || slug,
                        description: row[`desc_${lang}`]?.toString() || ''
                    }));

                await prisma.category.create({
                    data: {
                        slug,
                        translations: { create: translations.length > 0 ? translations : [{ language: 'en', name: slug, description: '' }] }
                    }
                });
            }
            imported++;
        }

        return NextResponse.json({ success: true, imported, total: rows.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
