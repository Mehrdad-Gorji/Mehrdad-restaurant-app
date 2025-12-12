import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    const guideData = [
        ['📋 EXTRA CATEGORIES IMPORT GUIDE'],
        [''],
        ['Column', 'Required', 'Description', 'Example'],
        ['id', 'NO', 'Leave empty for new. Provide ID to update existing.', ''],
        ['name_en', 'YES', 'Category name in English', 'Toppings'],
        ['name_sv', 'NO', 'Category name in Swedish', 'Toppingar'],
        ['name_fa', 'NO', 'Category name in Farsi', 'تاپینگ‌ها'],
        ['name_de', 'NO', 'Category name in German', 'Beläge'],
    ];

    const exampleData = [
        ['id', 'name_en', 'name_sv', 'name_fa', 'name_de'],
        ['', 'Toppings', 'Toppingar', 'تاپینگ‌ها', 'Beläge'],
        ['', 'Sauces', 'Såser', 'سس‌ها', 'Saucen'],
        ['', 'Meat', 'Kött', 'گوشت', 'Fleisch'],
        ['', 'Cheese', 'Ost', 'پنیر', 'Käse'],
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(guideData), 'Guide');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(exampleData), 'ExtraCategories');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="extra_categories_template.xlsx"'
        }
    });
}
