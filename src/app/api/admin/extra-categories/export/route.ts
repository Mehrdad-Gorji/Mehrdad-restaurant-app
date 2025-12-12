import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
    try {
        const categories = await prisma.extraCategory.findMany({
            include: { translations: true },
            orderBy: { id: 'asc' }
        });

        const rows = categories.map(cat => {
            const getTrans = (lang: string) => cat.translations.find(t => t.language === lang);
            return {
                id: cat.id,
                name_en: getTrans('en')?.name || '',
                name_sv: getTrans('sv')?.name || '',
                name_fa: getTrans('fa')?.name || '',
                name_de: getTrans('de')?.name || '',
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ExtraCategories');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="extra_categories_export.xlsx"'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
