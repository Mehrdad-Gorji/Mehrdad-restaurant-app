import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
    try {
        const combos = await prisma.combo.findMany({
            include: {
                translations: true,
                items: {
                    include: {
                        product: { include: { translations: true } }
                    }
                }
            },
            orderBy: { id: 'asc' }
        });

        const rows = combos.map(combo => {
            const getTrans = (lang: string) => combo.translations.find(t => t.language === lang);
            const productSlugs = combo.items.map(item => item.product.slug).join(', ');

            return {
                slug: combo.slug,
                price: Number(combo.price),
                discountType: combo.discountType || '',
                discountValue: combo.discountValue ? Number(combo.discountValue) : '',
                image: combo.image || '',
                products: productSlugs,
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Combos');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="combos_export.xlsx"'
            }
        });
    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
