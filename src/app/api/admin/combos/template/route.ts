import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    const guideData = [
        ['📋 COMBOS IMPORT GUIDE'],
        [''],
        ['Column', 'Required', 'Description', 'Example'],
        ['slug', 'YES', 'Unique identifier (lowercase, hyphens)', 'family-meal'],
        ['price', 'YES', 'Combo price', '299'],
        ['discountType', 'NO', 'PERCENTAGE or FIXED', 'PERCENTAGE'],
        ['discountValue', 'NO', 'Discount amount', '20'],
        ['image', 'NO', 'Image URL', ''],
        ['products', 'NO', 'Product slugs separated by comma', 'pizza-margherita, caesar-salad, cola'],
        ['name_en', 'YES', 'Combo name in English', 'Family Meal Deal'],
        ['desc_en', 'NO', 'Description in English', 'Perfect for 4 people'],
        ['name_sv', 'NO', 'Combo name in Swedish', 'Familjemiddag'],
        ['desc_sv', 'NO', 'Description in Swedish', ''],
        ['name_fa', 'NO', 'Combo name in Farsi', 'پکیج خانوادگی'],
        ['desc_fa', 'NO', 'Description in Farsi', ''],
        ['name_de', 'NO', 'Combo name in German', 'Familienessen'],
        ['desc_de', 'NO', 'Description in German', ''],
        [''],
        ['⚠️ IMPORTANT:'],
        ['Products must already exist in database. Use product slugs separated by comma.', '', '', ''],
    ];

    const exampleData = [
        ['slug', 'price', 'discountLabel', 'image', 'products', 'name_en', 'desc_en', 'name_sv', 'desc_sv', 'name_fa', 'desc_fa', 'name_de', 'desc_de'],
        ['family-meal', 299, 'Save 20%', '', 'pizza-margherita, caesar-salad', 'Family Meal Deal', 'Perfect for 4 people', 'Familjemiddag', 'Perfekt för 4 personer', 'پکیج خانوادگی', 'مناسب برای ۴ نفر', 'Familienessen', 'Perfekt für 4 Personen'],
        ['lunch-special', 149, 'Lunch Deal', '', 'pizza-diavola', 'Lunch Special', 'Quick and tasty lunch', 'Lunchspecial', 'Snabb och god lunch', 'ویژه ناهار', 'ناهار سریع و خوشمزه', 'Mittagsangebot', 'Schnelles leckeres Mittagessen'],
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(guideData), 'Guide');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(exampleData), 'Combos');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="combos_template.xlsx"'
        }
    });
}
