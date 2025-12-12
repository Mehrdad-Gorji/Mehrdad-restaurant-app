import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
    try {
        const categories = await prisma.category.findMany({
            include: { translations: true },
            orderBy: { slug: 'asc' }
        });

        const rows = categories.map(cat => {
            const getTrans = (lang: string) => cat.translations.find(t => t.language === lang);
            return {
                slug: cat.slug,
                name_en: getTrans('en')?.name || '',
                desc_en: getTrans('en')?.description || '',
                name_sv: getTrans('sv')?.name || '',
                desc_sv: getTrans('sv')?.description || '',
                name_fa: getTrans('fa')?.name || '',
                desc_fa: getTrans('fa')?.description || '',
                name_de: getTrans('de')?.name || '',
                desc_de: getTrans('de')?.description || '',
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="categories_export.xlsx"'
            }
        });
    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
