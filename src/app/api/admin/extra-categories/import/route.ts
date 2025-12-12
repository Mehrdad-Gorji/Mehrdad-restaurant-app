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

        // Find data sheet (skip Guide sheet)
        const dataSheetName = workbook.SheetNames.find(s => s !== 'Guide') || workbook.SheetNames[0];
        const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[dataSheetName]);

        console.log('Import Extra Categories - Rows:', rows.length, 'Sheet:', dataSheetName);

        let imported = 0;
        const languages = ['en', 'sv', 'fa', 'de'];

        for (const row of rows) {
            const existingId = row.id?.toString().trim();

            if (existingId) {
                // Update existing
                const existing = await prisma.extraCategory.findUnique({ where: { id: existingId } });
                if (existing) {
                    for (const lang of languages) {
                        const name = row[`name_${lang}`]?.toString();
                        if (name) {
                            await prisma.extraCategoryTranslation.upsert({
                                where: { extraCategoryId_language: { extraCategoryId: existingId, language: lang } },
                                update: { name },
                                create: { extraCategoryId: existingId, language: lang, name }
                            });
                        }
                    }
                    imported++;
                    continue;
                }
            }

            // Create new
            const translations = languages
                .filter(lang => row[`name_${lang}`])
                .map(lang => ({ language: lang, name: row[`name_${lang}`]?.toString() || '' }));

            if (translations.length > 0) {
                await prisma.extraCategory.create({
                    data: { translations: { create: translations } }
                });
                imported++;
            }
        }

        return NextResponse.json({ success: true, imported, total: rows.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
