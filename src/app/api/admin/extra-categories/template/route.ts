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
        [''],
        ['⚠️ NOTES:'],
        ['1. Categories help organize extras into groups'],
        ['2. Leave ID empty for new categories'],
        ['3. Provide ID to update existing category translations'],
    ];

    const exampleData = [
        ['id', 'name_en', 'name_sv', 'name_fa', 'name_de'],
        ['', 'Cheese', 'Ost', 'پنیر', 'Käse'],
        ['', 'Meat', 'Kött', 'گوشت', 'Fleisch'],
        ['', 'Vegetables', 'Grönsaker', 'سبزیجات', 'Gemüse'],
        ['', 'Sauces', 'Såser', 'سس‌ها', 'Saucen'],
        ['', 'Toppings', 'Toppingar', 'تاپینگ‌ها', 'Beläge'],
        ['', 'Sides', 'Tillbehör', 'پیش‌مزه', 'Beilagen'],
        ['', 'Seafood', 'Skaldjur', 'غذاهای دریایی', 'Meeresfrüchte'],
        ['', 'Spices', 'Kryddor', 'ادویه‌ها', 'Gewürze'],
        ['', 'Dressings', 'Dressinger', 'سس سالاد', 'Dressings'],
        ['', 'Extras', 'Extra', 'اضافات', 'Extras'],
    ];

    const workbook = XLSX.utils.book_new();

    const guideSheet = XLSX.utils.aoa_to_sheet(guideData);
    guideSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 50 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'Guide');

    const categoriesSheet = XLSX.utils.aoa_to_sheet(exampleData);
    categoriesSheet['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'ExtraCategories');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="extra_categories_template.xlsx"'
        }
    });
}
