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
        ['isActive', 'NO', 'YES/NO - Is combo available?', 'YES'],
        ['products', 'NO', 'Product slugs separated by comma', 'pizza-margherita, caesar-salad, drink-soda'],
        ['name_en', 'YES', 'Combo name in English', 'Family Meal Deal'],
        ['desc_en', 'NO', 'Description in English', 'Perfect for 4 people'],
        ['name_sv', 'NO', 'Combo name in Swedish', 'Familjemiddag'],
        ['desc_sv', 'NO', 'Description in Swedish', 'Perfekt för 4 personer'],
        ['name_fa', 'NO', 'Combo name in Farsi', 'پکیج خانوادگی'],
        ['desc_fa', 'NO', 'Description in Farsi', 'مناسب برای ۴ نفر'],
        ['name_de', 'NO', 'Combo name in German', 'Familienessen'],
        ['desc_de', 'NO', 'Description in German', 'Perfekt für 4 Personen'],
        [''],
        ['⚠️ IMPORTANT:'],
        ['1. Products must already exist in database. Use product slugs separated by comma.'],
        ['2. Use PERCENTAGE or FIXED for discountType'],
        ['3. If slug exists, combo will be UPDATED'],
    ];

    const exampleData = [
        ['slug', 'price', 'discountType', 'discountValue', 'image', 'isActive', 'products', 'name_en', 'desc_en', 'name_sv', 'desc_sv', 'name_fa', 'desc_fa', 'name_de', 'desc_de'],
        // Family Deals
        ['family-feast', 449, 'PERCENTAGE', 25, '', 'YES', 'pizza-margherita, pizza-pepperoni, caesar-salad, drink-soda', 'Family Feast', '2 Large pizzas, 1 salad, and 4 drinks for the whole family', 'Familjefest', '2 Stora pizzor, 1 sallad och 4 drycker för hela familjen', 'ضیافت خانوادگی', '۲ پیتزای بزرگ، ۱ سالاد و ۴ نوشیدنی برای تمام خانواده', 'Familienfest', '2 große Pizzen, 1 Salat und 4 Getränke für die ganze Familie'],
        ['super-family', 599, 'FIXED', 100, '', 'YES', 'pizza-quattro-formaggi, pizza-bbq-chicken, pasta-carbonara, dessert-tiramisu', 'Super Family Deal', 'Complete meal for 5-6 people with dessert', 'Super Familjedeal', 'Komplett måltid för 5-6 personer med dessert', 'پکیج سوپر خانوادگی', 'وعده کامل برای ۵-۶ نفر با دسر', 'Super-Familienpaket', 'Komplettes Menü für 5-6 Personen mit Dessert'],
        // Lunch Deals
        ['lunch-special', 149, 'PERCENTAGE', 20, '', 'YES', 'pasta-bolognese, salad-garden, drink-soda', 'Lunch Special', 'Quick lunch with pasta, salad and drink', 'Lunchspecial', 'Snabb lunch med pasta, sallad och dryck', 'ویژه ناهار', 'ناهار سریع با پاستا، سالاد و نوشیدنی', 'Mittagsangebot', 'Schnelles Mittagessen mit Pasta, Salat und Getränk'],
        ['express-lunch', 129, 'PERCENTAGE', 15, '', 'YES', 'burger-classic, drink-soda', 'Express Lunch', 'Burger with fries and drink - ready in 10 minutes', 'Expresslunch', 'Burgare med pommes och dryck - klart på 10 minuter', 'ناهار اکسپرس', 'برگر با سیب‌زمینی و نوشیدنی - آماده در ۱۰ دقیقه', 'Express-Mittagessen', 'Burger mit Pommes und Getränk - fertig in 10 Minuten'],
        ['business-lunch', 189, 'PERCENTAGE', 18, '', 'YES', 'salad-caesar, pasta-pesto, drink-water', 'Business Lunch', 'Light and healthy lunch for professionals', 'Affärslunch', 'Lätt och hälsosam lunch för yrkesverksamma', 'ناهار کاری', 'ناهار سبک و سالم برای حرفه‌ای‌ها', 'Business-Lunch', 'Leichtes und gesundes Mittagessen für Berufstätige'],
        // Couple Deals
        ['romantic-dinner', 399, 'PERCENTAGE', 22, '', 'YES', 'appetizer-bruschetta, pizza-prosciutto, dessert-tiramisu, drink-wine', 'Romantic Dinner', 'Perfect date night with appetizer, main, dessert and wine', 'Romantisk Middag', 'Perfekt dejtkväll med förrätt, huvudrätt, dessert och vin', 'شام رمانتیک', 'شب قرار عالی با پیش‌غذا، غذای اصلی، دسر و شراب', 'Romantisches Abendessen', 'Perfekter Dateabend mit Vorspeise, Hauptgang, Dessert und Wein'],
        ['date-night', 299, 'FIXED', 50, '', 'YES', 'pizza-margherita, salad-caprese, drink-wine', 'Date Night Deal', 'Share a pizza, salad and wine', 'Dejtkväll Deal', 'Dela en pizza, sallad och vin', 'پکیج شب قرار', 'یک پیتزا، سالاد و شراب مشترک', 'Date-Night-Angebot', 'Teilen Sie eine Pizza, einen Salat und Wein'],
        // Student/Budget Deals
        ['student-deal', 99, 'PERCENTAGE', 30, '', 'YES', 'pizza-marinara, drink-soda', 'Student Deal', 'Budget-friendly meal for students (valid ID required)', 'Studentdeal', 'Budgetvänlig måltid för studenter (giltigt ID krävs)', 'پکیج دانشجویی', 'وعده مقرون به صرفه برای دانشجویان (کارت دانشجویی لازم)', 'Studentenangebot', 'Budgetfreundliches Menü für Studenten (gültiger Ausweis erforderlich)'],
        ['budget-meal', 119, 'PERCENTAGE', 25, '', 'YES', 'burger-classic, drink-soda', 'Budget Meal', 'Great taste at a great price', 'Budgetmåltid', 'Bra smak till ett bra pris', 'وعده اقتصادی', 'طعم عالی با قیمت عالی', 'Budget-Menü', 'Toller Geschmack zu einem tollen Preis'],
        // Party Packs
        ['party-pack-small', 699, 'PERCENTAGE', 28, '', 'YES', 'pizza-margherita, pizza-pepperoni, pizza-vegetariana, appetizer-wings, drink-soda', 'Party Pack (8-10 people)', '3 large pizzas, wings, and drinks for your party', 'Partypaket (8-10 personer)', '3 stora pizzor, vingar och drycker för din fest', 'پکیج مهمانی کوچک', '۳ پیتزای بزرگ، بال و نوشیدنی برای مهمانی شما', 'Party-Paket (8-10 Personen)', '3 große Pizzen, Wings und Getränke für Ihre Party'],
        ['party-pack-large', 999, 'PERCENTAGE', 32, '', 'YES', 'pizza-margherita, pizza-pepperoni, pizza-hawaiian, pizza-bbq-chicken, appetizer-nachos, dessert-chocolate-cake', 'Party Pack XL (15-20 people)', 'Ultimate party experience with 4 pizzas, nachos and cake', 'Partypaket XL (15-20 personer)', 'Ultimat festupplevelse med 4 pizzor, nachos och tårta', 'پکیج مهمانی بزرگ', 'تجربه مهمانی نهایی با ۴ پیتزا، ناچوز و کیک', 'Party-Paket XL (15-20 Personen)', 'Ultimatives Party-Erlebnis mit 4 Pizzen, Nachos und Kuchen'],
        // Kids Deals
        ['kids-meal', 79, 'PERCENTAGE', 20, '', 'YES', 'pizza-margherita, drink-juice', 'Kids Meal', 'Small pizza with juice and a surprise toy', 'Barnmeny', 'Liten pizza med juice och en överraskningsleksak', 'منوی کودک', 'پیتزای کوچک با آبمیوه و یک اسباب‌بازی سورپرایز', 'Kindermenü', 'Kleine Pizza mit Saft und einem Überraschungsspielzeug'],
    ];

    const workbook = XLSX.utils.book_new();

    const guideSheet = XLSX.utils.aoa_to_sheet(guideData);
    guideSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 55 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'Guide');

    const combosSheet = XLSX.utils.aoa_to_sheet(exampleData);
    combosSheet['!cols'] = [
        { wch: 18 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 40 }, { wch: 10 },
        { wch: 60 }, { wch: 28 }, { wch: 55 }, { wch: 25 }, { wch: 50 },
        { wch: 22 }, { wch: 45 }, { wch: 28 }, { wch: 55 }
    ];
    XLSX.utils.book_append_sheet(workbook, combosSheet, 'Combos');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="combos_template.xlsx"'
        }
    });
}
