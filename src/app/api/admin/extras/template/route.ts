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
        ['category_en', 'NO', 'Category name in English (auto-creates if not exists)', 'Toppings'],
        ['name_en', 'YES', 'Extra name in English', 'Extra Cheese'],
        ['name_sv', 'NO', 'Extra name in Swedish', 'Extra Ost'],
        ['name_fa', 'NO', 'Extra name in Farsi', 'پنیر اضافه'],
        ['name_de', 'NO', 'Extra name in German', 'Extra Käse'],
        [''],
        ['⚠️ NOTES:'],
        ['1. Categories are created automatically if they don\'t exist'],
        ['2. Leave ID empty for new extras, provide ID to update existing ones'],
    ];

    const exampleData = [
        ['id', 'price', 'image', 'category_en', 'name_en', 'name_sv', 'name_fa', 'name_de'],
        // Cheese
        ['', 15, '', 'Cheese', 'Extra Mozzarella', 'Extra Mozzarella', 'موزارلا اضافه', 'Extra Mozzarella'],
        ['', 20, '', 'Cheese', 'Parmesan', 'Parmesan', 'پارمزان', 'Parmesan'],
        ['', 18, '', 'Cheese', 'Gorgonzola', 'Gorgonzola', 'گورگونزولا', 'Gorgonzola'],
        ['', 15, '', 'Cheese', 'Feta Cheese', 'Fetaost', 'پنیر فتا', 'Feta-Käse'],
        ['', 25, '', 'Cheese', 'Burrata', 'Burrata', 'بوراتا', 'Burrata'],
        // Meat
        ['', 25, '', 'Meat', 'Pepperoni', 'Pepperoni', 'پپرونی', 'Pepperoni'],
        ['', 30, '', 'Meat', 'Grilled Chicken', 'Grillad Kyckling', 'مرغ گریل شده', 'Gegrilltes Hähnchen'],
        ['', 25, '', 'Meat', 'Crispy Bacon', 'Frasig Bacon', 'بیکن کریسپی', 'Knuspriger Speck'],
        ['', 35, '', 'Meat', 'Italian Sausage', 'Italiensk Korv', 'سوسیس ایتالیایی', 'Italienische Wurst'],
        ['', 30, '', 'Meat', 'Ham', 'Skinka', 'ژامبون', 'Schinken'],
        ['', 40, '', 'Meat', 'Prosciutto', 'Prosciutto', 'پروشوتو', 'Prosciutto'],
        // Vegetables
        ['', 10, '', 'Vegetables', 'Fresh Mushrooms', 'Färska Champinjoner', 'قارچ تازه', 'Frische Pilze'],
        ['', 10, '', 'Vegetables', 'Bell Peppers', 'Paprika', 'فلفل دلمه‌ای', 'Paprika'],
        ['', 10, '', 'Vegetables', 'Red Onion', 'Rödlök', 'پیاز قرمز', 'Rote Zwiebeln'],
        ['', 12, '', 'Vegetables', 'Black Olives', 'Svarta Oliver', 'زیتون سیاه', 'Schwarze Oliven'],
        ['', 15, '', 'Vegetables', 'Jalapeño', 'Jalapeño', 'خلاپنو', 'Jalapeño'],
        ['', 12, '', 'Vegetables', 'Fresh Tomatoes', 'Färska Tomater', 'گوجه تازه', 'Frische Tomaten'],
        ['', 10, '', 'Vegetables', 'Fresh Basil', 'Färsk Basilika', 'ریحان تازه', 'Frisches Basilikum'],
        ['', 20, '', 'Vegetables', 'Avocado', 'Avokado', 'آووکادو', 'Avocado'],
        ['', 12, '', 'Vegetables', 'Arugula', 'Ruccola', 'روکولا', 'Rucola'],
        // Sauces
        ['', 10, '', 'Sauces', 'Garlic Sauce', 'Vitlökssås', 'سس سیر', 'Knoblauchsauce'],
        ['', 10, '', 'Sauces', 'BBQ Sauce', 'BBQ Sås', 'سس باربیکیو', 'BBQ-Sauce'],
        ['', 10, '', 'Sauces', 'Hot Sauce', 'Stark Sås', 'سس تند', 'Scharfe Sauce'],
        ['', 12, '', 'Sauces', 'Truffle Oil', 'Tryffelolja', 'روغن ترافل', 'Trüffelöl'],
        ['', 10, '', 'Sauces', 'Ranch Dressing', 'Ranch Dressing', 'سس رنچ', 'Ranch-Dressing'],
        ['', 10, '', 'Sauces', 'Aioli', 'Aioli', 'آیولی', 'Aioli'],
        // Sides
        ['', 20, '', 'Sides', 'French Fries', 'Pommes Frites', 'سیب‌زمینی سرخ‌کرده', 'Pommes Frites'],
        ['', 25, '', 'Sides', 'Sweet Potato Fries', 'Sötpotatis Frites', 'سیب‌زمینی شیرین سرخ‌کرده', 'Süßkartoffel-Pommes'],
        ['', 20, '', 'Sides', 'Onion Rings', 'Lökringar', 'حلقه پیاز', 'Zwiebelringe'],
    ];

    const workbook = XLSX.utils.book_new();

    const guideSheet = XLSX.utils.aoa_to_sheet(guideData);
    guideSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 55 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'Guide');

    const extrasSheet = XLSX.utils.aoa_to_sheet(exampleData);
    extrasSheet['!cols'] = [
        { wch: 10 }, { wch: 8 }, { wch: 40 }, { wch: 15 },
        { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(workbook, extrasSheet, 'Extras');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="extras_template.xlsx"'
        }
    });
}
