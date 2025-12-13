import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    const guideData = [
        ['📋 CATEGORY IMPORT GUIDE'],
        [''],
        ['Column', 'Required', 'Description', 'Example'],
        ['slug', 'YES', 'Unique identifier (lowercase, hyphens)', 'pizza'],
        ['image', 'NO', 'Category image URL', 'https://example.com/pizza.jpg'],
        ['name_en', 'YES', 'Category name in English', 'Pizza'],
        ['desc_en', 'NO', 'Description in English', 'Italian style pizzas'],
        ['name_sv', 'NO', 'Category name in Swedish', 'Pizza'],
        ['desc_sv', 'NO', 'Description in Swedish', 'Italienska pizzor'],
        ['name_fa', 'NO', 'Category name in Farsi', 'پیتزا'],
        ['desc_fa', 'NO', 'Description in Farsi', 'پیتزاهای ایتالیایی'],
        ['name_de', 'NO', 'Category name in German', 'Pizza'],
        ['desc_de', 'NO', 'Description in German', 'Italienische Pizzen'],
        [''],
        ['⚠️ NOTES:'],
        ['1. Slug must be unique for each category'],
        ['2. If a category with the same slug exists, it will be UPDATED'],
    ];

    const exampleData = [
        ['slug', 'image', 'name_en', 'desc_en', 'name_sv', 'desc_sv', 'name_fa', 'desc_fa', 'name_de', 'desc_de'],
        ['pizza', '', 'Pizza', 'Authentic Italian pizzas with fresh ingredients', 'Pizza', 'Autentiska italienska pizzor med färska ingredienser', 'پیتزا', 'پیتزاهای اصیل ایتالیایی با مواد تازه', 'Pizza', 'Authentische italienische Pizzen mit frischen Zutaten'],
        ['pasta', '', 'Pasta', 'Traditional Italian pasta dishes', 'Pasta', 'Traditionella italienska pastarätter', 'پاستا', 'پاستاهای سنتی ایتالیایی', 'Pasta', 'Traditionelle italienische Pastagerichte'],
        ['salads', '', 'Salads', 'Fresh and healthy salad selections', 'Sallader', 'Färska och hälsosamma salladsval', 'سالاد', 'انتخاب‌های سالاد تازه و سالم', 'Salate', 'Frische und gesunde Salatauswahl'],
        ['burgers', '', 'Burgers', 'Juicy handcrafted burgers', 'Hamburgare', 'Saftiga handgjorda hamburgare', 'برگر', 'برگرهای آبدار دست‌ساز', 'Burger', 'Saftige handgemachte Burger'],
        ['appetizers', '', 'Appetizers', 'Delicious starters to begin your meal', 'Förrätter', 'Läckra förrätter för att börja din måltid', 'پیش‌غذا', 'پیش‌غذاهای خوشمزه برای شروع وعده', 'Vorspeisen', 'Köstliche Vorspeisen für den Start'],
        ['desserts', '', 'Desserts', 'Sweet treats to end your meal', 'Efterrätter', 'Söta avslutningar till din måltid', 'دسر', 'شیرینی‌های لذیذ برای پایان وعده', 'Nachspeisen', 'Süße Leckereien zum Abschluss'],
        ['drinks', '', 'Drinks', 'Refreshing beverages', 'Drycker', 'Uppfriskande drycker', 'نوشیدنی', 'نوشیدنی‌های خنک‌کننده', 'Getränke', 'Erfrischende Getränke'],
        ['specials', '', 'Specials', 'Chef special dishes of the day', 'Specialer', 'Kockens speciella rätter för dagen', 'ویژه‌ها', 'غذاهای ویژه سرآشپز روز', 'Spezialitäten', 'Besondere Gerichte des Tages'],
        ['kids-menu', '', 'Kids Menu', 'Child-friendly portions and meals', 'Barnmeny', 'Barnvänliga portioner och måltider', 'منوی کودک', 'پرس‌ها و غذاهای مناسب کودکان', 'Kindermenü', 'Kinderfreundliche Portionen und Mahlzeiten'],
        ['sides', '', 'Sides', 'Perfect accompaniments to your meal', 'Tillbehör', 'Perfekta tillbehör till din måltid', 'پیش‌مزه', 'مکمل‌های عالی برای غذای شما', 'Beilagen', 'Perfekte Beilagen zu Ihrer Mahlzeit'],
    ];

    const workbook = XLSX.utils.book_new();

    const guideSheet = XLSX.utils.aoa_to_sheet(guideData);
    guideSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 50 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'Guide');

    const categoriesSheet = XLSX.utils.aoa_to_sheet(exampleData);
    categoriesSheet['!cols'] = [
        { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 45 },
        { wch: 20 }, { wch: 45 }, { wch: 20 }, { wch: 40 },
        { wch: 20 }, { wch: 45 }
    ];
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="categories_template.xlsx"'
        }
    });
}
