import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
    try {
        const extras = await prisma.extra.findMany({
            include: {
                translations: true,
                category: { include: { translations: true } }
            },
            orderBy: { id: 'asc' }
        });

        const rows = extras.map(extra => {
            const getTrans = (lang: string) => extra.translations.find(t => t.language === lang);
            const getCatName = (lang: string) => extra.category?.translations.find(t => t.language === lang)?.name || '';

            return {
                id: extra.id,
                price: Number(extra.price),
                image: extra.image || '',
                category_en: getCatName('en'),
                name_en: getTrans('en')?.name || '',
                name_sv: getTrans('sv')?.name || '',
                name_fa: getTrans('fa')?.name || '',
                name_de: getTrans('de')?.name || '',
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Extras');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="extras_export.xlsx"'
            }
        });
    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
