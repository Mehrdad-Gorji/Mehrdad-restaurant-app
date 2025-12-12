import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
    try {
        // Create workbook
        const workbook = XLSX.utils.book_new();

        // === Sheet 1: Instructions (Guide) ===
        const guideData = [
            ['📋 PRODUCT IMPORT GUIDE', '', '', ''],
            ['', '', '', ''],
            ['This template helps you import products into the restaurant system.', '', '', ''],
            ['', '', '', ''],
            ['📌 COLUMN DESCRIPTIONS:', '', '', ''],
            ['Column', 'Required', 'Description', 'Example'],
            ['slug', 'YES', 'Unique identifier (lowercase, no spaces, use hyphens)', 'pizza-margherita'],
            ['price', 'YES', 'Product price (number only)', '129'],
            ['category_en', 'YES', 'Category name in English (creates new if not exists)', 'Pizza'],
            ['category_sv', 'NO', 'Category name in Swedish', 'Pizza'],
            ['image', 'NO', 'Image URL (leave empty if no image)', 'https://example.com/pizza.jpg'],
            ['name_en', 'YES', 'Product name in English', 'Margherita Pizza'],
            ['desc_en', 'NO', 'Description in English', 'Classic Italian pizza with tomato and cheese'],
            ['name_sv', 'NO', 'Product name in Swedish', 'Margherita Pizza'],
            ['desc_sv', 'NO', 'Description in Swedish', 'Klassisk italiensk pizza'],
            ['name_fa', 'NO', 'Product name in Farsi', 'پیتزا مارگاریتا'],
            ['desc_fa', 'NO', 'Description in Farsi', 'پیتزای کلاسیک ایتالیایی'],
            ['name_de', 'NO', 'Product name in German', 'Margherita Pizza'],
            ['desc_de', 'NO', 'Description in German', 'Klassische italienische Pizza'],
            ['isSpicy', 'NO', 'Is the product spicy? (YES/NO)', 'NO'],
            ['isVegetarian', 'NO', 'Is vegetarian? (YES/NO)', 'YES'],
            ['isGlutenFree', 'NO', 'Is gluten-free? (YES/NO)', 'NO'],
            ['isVegan', 'NO', 'Is vegan? (YES/NO)', 'NO'],
            ['isFeatured', 'NO', 'Show on homepage? (YES/NO)', 'YES'],
            ['isTrending', 'NO', 'Mark as trending? (YES/NO)', 'NO'],
            ['', '', '', ''],
            ['⚠️ IMPORTANT NOTES:', '', '', ''],
            ['1. The "slug" must be unique for each product.', '', '', ''],
            ['2. If a product with the same slug exists, it will be UPDATED.', '', '', ''],
            ['3. Categories are matched by English name. New categories are auto-created.', '', '', ''],
            ['4. Use YES/NO for boolean fields (isSpicy, isVegetarian, etc.)', '', '', ''],
            ['5. Leave cells empty if you don\'t have the data.', '', '', ''],
        ];

        const guideSheet = XLSX.utils.aoa_to_sheet(guideData);

        // Set column widths
        guideSheet['!cols'] = [
            { wch: 20 }, { wch: 12 }, { wch: 55 }, { wch: 40 }
        ];

        XLSX.utils.book_append_sheet(workbook, guideSheet, 'Guide');

        // === Sheet 2: Products Template with Examples ===
        const productsData = [
            // Header row
            [
                'slug', 'price', 'category_en', 'category_sv', 'image',
                'name_en', 'desc_en', 'name_sv', 'desc_sv',
                'name_fa', 'desc_fa', 'name_de', 'desc_de',
                'isSpicy', 'isVegetarian', 'isGlutenFree', 'isVegan', 'isFeatured', 'isTrending'
            ],
            // Example 1: Pizza
            [
                'pizza-margherita', 129, 'Pizza', 'Pizza', '',
                'Margherita Pizza', 'Classic Italian pizza with fresh tomato sauce, mozzarella, and basil',
                'Margherita Pizza', 'Klassisk italiensk pizza med tomatsås, mozzarella och basilika',
                'پیتزا مارگاریتا', 'پیتزای کلاسیک ایتالیایی با سس گوجه، پنیر موزارلا و ریحان',
                'Margherita Pizza', 'Klassische italienische Pizza mit Tomatensauce, Mozzarella und Basilikum',
                'NO', 'YES', 'NO', 'NO', 'YES', 'NO'
            ],
            // Example 2: Spicy Pizza
            [
                'pizza-diavola', 149, 'Pizza', 'Pizza', '',
                'Diavola Pizza', 'Spicy pizza with salami, chili peppers, and mozzarella',
                'Diavola Pizza', 'Kryddig pizza med salami, chilipeppar och mozzarella',
                'پیتزا دیاولا', 'پیتزای تند با سالامی، فلفل چیلی و موزارلا',
                'Diavola Pizza', 'Scharfe Pizza mit Salami, Chilischoten und Mozzarella',
                'YES', 'NO', 'NO', 'NO', 'NO', 'YES'
            ],
            // Example 3: Salad
            [
                'caesar-salad', 89, 'Salads', 'Sallader', '',
                'Caesar Salad', 'Fresh romaine lettuce with parmesan, croutons, and Caesar dressing',
                'Caesar Sallad', 'Färsk romansallad med parmesan, krutonger och caesardressing',
                'سالاد سزار', 'کاهوی تازه با پنیر پارمزان، نان سوخاری و سس سزار',
                'Caesar Salat', 'Frischer Römersalat mit Parmesan, Croutons und Caesar-Dressing',
                'NO', 'YES', 'NO', 'NO', 'NO', 'NO'
            ],
            // Example 4: Vegan option
            [
                'vegan-buddha-bowl', 119, 'Bowls', 'Bowls', '',
                'Vegan Buddha Bowl', 'Healthy bowl with quinoa, avocado, chickpeas, and tahini',
                'Vegansk Buddha Bowl', 'Hälsosam skål med quinoa, avokado, kikärtor och tahini',
                'باول بودا وگان', 'کاسه سالم با کینوا، آووکادو، نخود و کنجد',
                'Vegane Buddha Bowl', 'Gesunde Schüssel mit Quinoa, Avocado, Kichererbsen und Tahini',
                'NO', 'YES', 'YES', 'YES', 'YES', 'YES'
            ],
            // Empty rows for user to fill
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ];

        const productsSheet = XLSX.utils.aoa_to_sheet(productsData);

        // Set column widths for products sheet
        productsSheet['!cols'] = [
            { wch: 22 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
            { wch: 25 }, { wch: 50 }, { wch: 25 }, { wch: 50 },
            { wch: 25 }, { wch: 50 }, { wch: 25 }, { wch: 50 },
            { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
        ];

        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Return as downloadable file
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="product_import_template.xlsx"'
            }
        });

    } catch (error) {
        console.error('Template Error:', error);
        return NextResponse.json({ error: 'Template generation failed' }, { status: 500 });
    }
}
