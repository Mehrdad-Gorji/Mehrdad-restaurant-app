import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    const guideData = [
        ['📋 EXTRAS IMPORT GUIDE'],
        [''],
        ['Column', 'Required', 'Description', 'Example'],
        ['id', 'NO', 'Leave empty for new extras. Provide ID to update existing.', ''],
        ['price', 'YES', 'Price of the extra (number)', '15'],
        ['image', 'NO', 'Image URL', ''],
        ['category_en', 'NO', 'Category name in English', 'Toppings'],
        ['name_en', 'YES', 'Extra name in English', 'Extra Cheese'],
        ['name_sv', 'NO', 'Extra name in Swedish', 'Extra Ost'],
        ['name_fa', 'NO', 'Extra name in Farsi', 'پنیر اضافه'],
        ['name_de', 'NO', 'Extra name in German', 'Extra Käse'],
    ];

    const exampleData = [
        ['id', 'price', 'image', 'category_en', 'name_en', 'name_sv', 'name_fa', 'name_de'],
        ['', 15, '', 'Toppings', 'Extra Cheese', 'Extra Ost', 'پنیر اضافه', 'Extra Käse'],
        ['', 20, '', 'Toppings', 'Pepperoni', 'Pepperoni', 'پپرونی', 'Pepperoni'],
        ['', 10, '', 'Sauces', 'Garlic Sauce', 'Vitlökssås', 'سس سیر', 'Knoblauchsauce'],
        ['', 25, '', 'Meat', 'Grilled Chicken', 'Grillad Kyckling', 'مرغ کبابی', 'Gegrilltes Hähnchen'],
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(guideData), 'Guide');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(exampleData), 'Extras');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="extras_template.xlsx"'
        }
    });
}
