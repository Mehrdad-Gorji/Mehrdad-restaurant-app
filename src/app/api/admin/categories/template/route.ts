import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    const guideData = [
        ['📋 CATEGORY IMPORT GUIDE'],
        [''],
        ['Column', 'Required', 'Description', 'Example'],
        ['slug', 'YES', 'Unique identifier (lowercase, hyphens)', 'pizza'],
        ['name_en', 'YES', 'Category name in English', 'Pizza'],
        ['desc_en', 'NO', 'Description in English', 'Italian style pizzas'],
        ['name_sv', 'NO', 'Category name in Swedish', 'Pizza'],
        ['desc_sv', 'NO', 'Description in Swedish', ''],
        ['name_fa', 'NO', 'Category name in Farsi', 'پیتزا'],
        ['desc_fa', 'NO', 'Description in Farsi', ''],
        ['name_de', 'NO', 'Category name in German', 'Pizza'],
        ['desc_de', 'NO', 'Description in German', ''],
    ];

    const exampleData = [
        ['slug', 'name_en', 'desc_en', 'name_sv', 'desc_sv', 'name_fa', 'desc_fa', 'name_de', 'desc_de'],
        ['pizza', 'Pizza', 'Italian style pizzas', 'Pizza', 'Italienska pizzor', 'پیتزا', 'پیتزاهای ایتالیایی', 'Pizza', 'Italienische Pizzen'],
        ['salads', 'Salads', 'Fresh and healthy salads', 'Sallader', 'Färska sallader', 'سالاد', 'سالادهای تازه', 'Salate', 'Frische Salate'],
        ['drinks', 'Drinks', 'Cold and hot beverages', 'Drycker', 'Varma och kalla drycker', 'نوشیدنی', 'نوشیدنی‌ها', 'Getränke', 'Getränke'],
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(guideData), 'Guide');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(exampleData), 'Categories');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="categories_template.xlsx"'
        }
    });
}
