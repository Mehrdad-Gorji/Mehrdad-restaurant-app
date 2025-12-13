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
        guideSheet['!cols'] = [
            { wch: 20 }, { wch: 12 }, { wch: 55 }, { wch: 40 }
        ];
        XLSX.utils.book_append_sheet(workbook, guideSheet, 'Guide');

        // === Sheet 2: Products Template with 60 Examples ===
        const productsData = [
            // Header row
            [
                'slug', 'price', 'category_en', 'category_sv', 'image',
                'name_en', 'desc_en', 'name_sv', 'desc_sv',
                'name_fa', 'desc_fa', 'name_de', 'desc_de',
                'isSpicy', 'isVegetarian', 'isGlutenFree', 'isVegan', 'isFeatured', 'isTrending'
            ],
            // PIZZAS (15 items)
            ['pizza-margherita', 129, 'Pizza', 'Pizza', '', 'Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and fresh basil', 'Margherita Pizza', 'Klassisk pizza med tomatsås, mozzarella och färsk basilika', 'پیتزا مارگاریتا', 'پیتزای کلاسیک با سس گوجه، موزارلا و ریحان تازه', 'Margherita Pizza', 'Klassische Pizza mit Tomatensauce, Mozzarella und frischem Basilikum', 'NO', 'YES', 'NO', 'NO', 'YES', 'NO'],
            ['pizza-pepperoni', 149, 'Pizza', 'Pizza', '', 'Pepperoni Pizza', 'Spicy pepperoni with mozzarella cheese', 'Pepperoni Pizza', 'Kryddig pepperoni med mozzarella', 'پیتزا پپرونی', 'پپرونی تند با پنیر موزارلا', 'Pepperoni Pizza', 'Würzige Pepperoni mit Mozzarella', 'YES', 'NO', 'NO', 'NO', 'YES', 'YES'],
            ['pizza-quattro-formaggi', 159, 'Pizza', 'Pizza', '', 'Quattro Formaggi', 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta', 'Fyra Ost Pizza', 'Fyra ost pizza med mozzarella, gorgonzola, parmesan och ricotta', 'پیتزا چهار پنیر', 'پیتزای چهار پنیر با موزارلا، گورگونزولا، پارمزان و ریکوتا', 'Quattro Formaggi', 'Vier-Käse-Pizza mit Mozzarella, Gorgonzola, Parmesan und Ricotta', 'NO', 'YES', 'NO', 'NO', 'NO', 'NO'],
            ['pizza-hawaiian', 139, 'Pizza', 'Pizza', '', 'Hawaiian Pizza', 'Ham and pineapple with mozzarella', 'Hawaii Pizza', 'Skinka och ananas med mozzarella', 'پیتزا هاوایی', 'ژامبون و آناناس با موزارلا', 'Hawaii Pizza', 'Schinken und Ananas mit Mozzarella', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['pizza-diavola', 149, 'Pizza', 'Pizza', '', 'Diavola Pizza', 'Spicy salami with chili peppers', 'Diavola Pizza', 'Kryddig salami med chilipeppar', 'پیتزا دیاولا', 'سالامی تند با فلفل چیلی', 'Diavola Pizza', 'Scharfe Salami mit Chilischoten', 'YES', 'NO', 'NO', 'NO', 'NO', 'YES'],
            ['pizza-vegetariana', 139, 'Pizza', 'Pizza', '', 'Vegetarian Pizza', 'Mixed vegetables with mozzarella and tomato sauce', 'Vegetarisk Pizza', 'Blandade grönsaker med mozzarella och tomatsås', 'پیتزا سبزیجات', 'سبزیجات مخلوط با موزارلا و سس گوجه', 'Vegetarische Pizza', 'Gemischtes Gemüse mit Mozzarella und Tomatensauce', 'NO', 'YES', 'NO', 'NO', 'YES', 'NO'],
            ['pizza-capricciosa', 159, 'Pizza', 'Pizza', '', 'Capricciosa Pizza', 'Ham, mushrooms, artichokes, and olives', 'Capricciosa Pizza', 'Skinka, champinjoner, kronärtskockor och oliver', 'پیتزا کاپریچوزا', 'ژامبون، قارچ، آرتیشو و زیتون', 'Capricciosa Pizza', 'Schinken, Pilze, Artischocken und Oliven', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['pizza-bbq-chicken', 159, 'Pizza', 'Pizza', '', 'BBQ Chicken Pizza', 'Grilled chicken with BBQ sauce and red onions', 'BBQ Kyckling Pizza', 'Grillad kyckling med BBQ-sås och rödlök', 'پیتزا مرغ باربیکیو', 'مرغ گریل شده با سس باربیکیو و پیاز قرمز', 'BBQ Hähnchen Pizza', 'Gegrilltes Hähnchen mit BBQ-Sauce und roten Zwiebeln', 'NO', 'NO', 'NO', 'NO', 'YES', 'YES'],
            ['pizza-tonno', 149, 'Pizza', 'Pizza', '', 'Tonno Pizza', 'Tuna with onions and capers', 'Tonfisk Pizza', 'Tonfisk med lök och kapris', 'پیتزا تن ماهی', 'ماهی تن با پیاز و کاپر', 'Tonno Pizza', 'Thunfisch mit Zwiebeln und Kapern', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['pizza-prosciutto', 159, 'Pizza', 'Pizza', '', 'Prosciutto Pizza', 'Parma ham with arugula and parmesan', 'Prosciutto Pizza', 'Parmaskinka med ruccola och parmesan', 'پیتزا پروشوتو', 'ژامبون پارما با روکولا و پارمزان', 'Prosciutto Pizza', 'Parmaschinken mit Rucola und Parmesan', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['pizza-funghi', 139, 'Pizza', 'Pizza', '', 'Funghi Pizza', 'Mixed mushrooms with truffle oil', 'Svamp Pizza', 'Blandade svampar med tryffelolja', 'پیتزا قارچ', 'قارچ‌های مخلوط با روغن ترافل', 'Funghi Pizza', 'Gemischte Pilze mit Trüffelöl', 'NO', 'YES', 'NO', 'NO', 'NO', 'NO'],
            ['pizza-calzone', 169, 'Pizza', 'Pizza', '', 'Calzone', 'Folded pizza with ricotta, ham, and mushrooms', 'Calzone', 'Dubbelvikt pizza med ricotta, skinka och champinjoner', 'کالزونه', 'پیتزای تاشده با ریکوتا، ژامبون و قارچ', 'Calzone', 'Gefaltete Pizza mit Ricotta, Schinken und Pilzen', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['pizza-siciliana', 159, 'Pizza', 'Pizza', '', 'Siciliana Pizza', 'Anchovies, capers, and olives', 'Siciliansk Pizza', 'Ansjovis, kapris och oliver', 'پیتزا سیسیلی', 'آنچوی، کاپر و زیتون', 'Sizilianische Pizza', 'Sardellen, Kapern und Oliven', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['pizza-marinara', 109, 'Pizza', 'Pizza', '', 'Marinara Pizza', 'Tomato, garlic, oregano, and olive oil (no cheese)', 'Marinara Pizza', 'Tomat, vitlök, oregano och olivolja (utan ost)', 'پیتزا مارینارا', 'گوجه، سیر، اورگانو و روغن زیتون (بدون پنیر)', 'Marinara Pizza', 'Tomate, Knoblauch, Oregano und Olivenöl (ohne Käse)', 'NO', 'YES', 'NO', 'YES', 'NO', 'NO'],
            ['pizza-napolitana', 139, 'Pizza', 'Pizza', '', 'Napolitana Pizza', 'Tomato, mozzarella, anchovies, and capers', 'Napolitansk Pizza', 'Tomat, mozzarella, ansjovis och kapris', 'پیتزا ناپولی', 'گوجه، موزارلا، آنچوی و کاپر', 'Neapolitanische Pizza', 'Tomate, Mozzarella, Sardellen und Kapern', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],

            // PASTA (10 items)
            ['pasta-carbonara', 149, 'Pasta', 'Pasta', '', 'Spaghetti Carbonara', 'Creamy pasta with bacon, egg, and parmesan', 'Spaghetti Carbonara', 'Krämig pasta med bacon, ägg och parmesan', 'اسپاگتی کاربونارا', 'پاستای خامه‌ای با بیکن، تخم‌مرغ و پارمزان', 'Spaghetti Carbonara', 'Cremige Pasta mit Speck, Ei und Parmesan', 'NO', 'NO', 'NO', 'NO', 'YES', 'YES'],
            ['pasta-bolognese', 139, 'Pasta', 'Pasta', '', 'Spaghetti Bolognese', 'Classic meat sauce with tomatoes', 'Spaghetti Bolognese', 'Klassisk köttfärssås med tomater', 'اسپاگتی بولونز', 'سس گوشت کلاسیک با گوجه', 'Spaghetti Bolognese', 'Klassische Fleischsauce mit Tomaten', 'NO', 'NO', 'NO', 'NO', 'YES', 'NO'],
            ['pasta-arrabbiata', 129, 'Pasta', 'Pasta', '', 'Penne Arrabbiata', 'Spicy tomato sauce with garlic and chili', 'Penne Arrabbiata', 'Kryddig tomatsås med vitlök och chili', 'پنه آرابیاتا', 'سس گوجه تند با سیر و چیلی', 'Penne Arrabbiata', 'Scharfe Tomatensauce mit Knoblauch und Chili', 'YES', 'YES', 'NO', 'YES', 'NO', 'NO'],
            ['pasta-alfredo', 149, 'Pasta', 'Pasta', '', 'Fettuccine Alfredo', 'Creamy parmesan sauce with butter', 'Fettuccine Alfredo', 'Krämig parmesansås med smör', 'فتوچینی آلفردو', 'سس پارمزان خامه‌ای با کره', 'Fettuccine Alfredo', 'Cremige Parmesansauce mit Butter', 'NO', 'YES', 'NO', 'NO', 'NO', 'NO'],
            ['pasta-pesto', 139, 'Pasta', 'Pasta', '', 'Penne Pesto', 'Fresh basil pesto with pine nuts', 'Penne Pesto', 'Färsk basilika pesto med pinjenötter', 'پنه پستو', 'پستوی ریحان تازه با بادام هندی', 'Penne Pesto', 'Frisches Basilikum-Pesto mit Pinienkernen', 'NO', 'YES', 'NO', 'NO', 'NO', 'NO'],
            ['pasta-aglio-olio', 119, 'Pasta', 'Pasta', '', 'Spaghetti Aglio e Olio', 'Garlic and olive oil with chili flakes', 'Spaghetti Aglio e Olio', 'Vitlök och olivolja med chili', 'اسپاگتی آلیو اولیو', 'سیر و روغن زیتون با چیلی', 'Spaghetti Aglio e Olio', 'Knoblauch und Olivenöl mit Chiliflocken', 'YES', 'YES', 'NO', 'YES', 'NO', 'NO'],
            ['pasta-lasagna', 169, 'Pasta', 'Pasta', '', 'Classic Lasagna', 'Layered pasta with beef ragu and bechamel', 'Klassisk Lasagne', 'Skiktad pasta med köttfärssås och bechamel', 'لازانیا کلاسیک', 'پاستای لایه‌ای با راگوی گوشت و بشامل', 'Klassische Lasagne', 'Schichtpasta mit Fleischragout und Bechamel', 'NO', 'NO', 'NO', 'NO', 'YES', 'NO'],
            ['pasta-ravioli', 159, 'Pasta', 'Pasta', '', 'Spinach Ravioli', 'Ricotta and spinach filled pasta', 'Spenat Ravioli', 'Ricotta och spenatfylld pasta', 'راویولی اسفناج', 'پاستای پر شده با ریکوتا و اسفناج', 'Spinat-Ravioli', 'Mit Ricotta und Spinat gefüllte Pasta', 'NO', 'YES', 'NO', 'NO', 'NO', 'NO'],
            ['pasta-primavera', 139, 'Pasta', 'Pasta', '', 'Pasta Primavera', 'Fresh vegetables in light olive oil sauce', 'Pasta Primavera', 'Färska grönsaker i lätt olivoljasås', 'پاستا پریماورا', 'سبزیجات تازه در سس روغن زیتون سبک', 'Pasta Primavera', 'Frisches Gemüse in leichter Olivenölsauce', 'NO', 'YES', 'NO', 'YES', 'NO', 'NO'],
            ['pasta-seafood', 189, 'Pasta', 'Pasta', '', 'Seafood Linguine', 'Mixed seafood in white wine sauce', 'Skaldjurs Linguine', 'Blandade skaldjur i vitvinssås', 'لینگوینی دریایی', 'انواع غذاهای دریایی در سس شراب سفید', 'Meeresfrüchte Linguine', 'Gemischte Meeresfrüchte in Weißweinsauce', 'NO', 'NO', 'NO', 'NO', 'NO', 'YES'],

            // SALADS (10 items)
            ['salad-caesar', 89, 'Salads', 'Sallader', '', 'Caesar Salad', 'Romaine lettuce with parmesan and croutons', 'Caesar Sallad', 'Romansallad med parmesan och krutonger', 'سالاد سزار', 'کاهوی رومن با پارمزان و نان سوخاری', 'Caesar Salat', 'Römersalat mit Parmesan und Croutons', 'NO', 'YES', 'NO', 'NO', 'YES', 'NO'],
            ['salad-greek', 99, 'Salads', 'Sallader', '', 'Greek Salad', 'Tomatoes, cucumber, olives, and feta cheese', 'Grekisk Sallad', 'Tomater, gurka, oliver och fetaost', 'سالاد یونانی', 'گوجه، خیار، زیتون و پنیر فتا', 'Griechischer Salat', 'Tomaten, Gurken, Oliven und Feta', 'NO', 'YES', 'YES', 'YES', 'YES', 'NO'],
            ['salad-caprese', 99, 'Salads', 'Sallader', '', 'Caprese Salad', 'Fresh mozzarella with tomatoes and basil', 'Caprese Sallad', 'Färsk mozzarella med tomater och basilika', 'سالاد کاپرزه', 'موزارلای تازه با گوجه و ریحان', 'Caprese Salat', 'Frischer Mozzarella mit Tomaten und Basilikum', 'NO', 'YES', 'YES', 'NO', 'NO', 'NO'],
            ['salad-chicken', 119, 'Salads', 'Sallader', '', 'Grilled Chicken Salad', 'Mixed greens with grilled chicken breast', 'Grillad Kyckling Sallad', 'Blandad sallad med grillad kycklingbröst', 'سالاد مرغ گریل', 'سبزیجات مخلوط با سینه مرغ گریل شده', 'Gegrillter Hühnchensalat', 'Gemischter Salat mit gegrillter Hähnchenbrust', 'NO', 'NO', 'YES', 'NO', 'NO', 'NO'],
            ['salad-nicoise', 129, 'Salads', 'Sallader', '', 'Nicoise Salad', 'Tuna, eggs, olives, and green beans', 'Nicoise Sallad', 'Tonfisk, ägg, oliver och haricots verts', 'سالاد نیسواز', 'تن ماهی، تخم‌مرغ، زیتون و لوبیا سبز', 'Nizza-Salat', 'Thunfisch, Eier, Oliven und grüne Bohnen', 'NO', 'NO', 'YES', 'NO', 'NO', 'NO'],
            ['salad-garden', 79, 'Salads', 'Sallader', '', 'Garden Salad', 'Fresh mixed vegetables', 'Trädgårdssallad', 'Färska blandade grönsaker', 'سالاد باغ', 'سبزیجات تازه مخلوط', 'Gartensalat', 'Frisches gemischtes Gemüse', 'NO', 'YES', 'YES', 'YES', 'NO', 'NO'],
            ['salad-quinoa', 119, 'Salads', 'Sallader', '', 'Quinoa Salad', 'Quinoa with roasted vegetables', 'Quinoa Sallad', 'Quinoa med rostade grönsaker', 'سالاد کینوا', 'کینوا با سبزیجات کبابی', 'Quinoa-Salat', 'Quinoa mit geröstetem Gemüse', 'NO', 'YES', 'YES', 'YES', 'NO', 'YES'],
            ['salad-avocado', 109, 'Salads', 'Sallader', '', 'Avocado Salad', 'Fresh avocado with cherry tomatoes', 'Avokado Sallad', 'Färsk avokado med körsbärstomater', 'سالاد آووکادو', 'آووکادوی تازه با گوجه گیلاسی', 'Avocado-Salat', 'Frische Avocado mit Kirschtomaten', 'NO', 'YES', 'YES', 'YES', 'NO', 'NO'],
            ['salad-tuna', 109, 'Salads', 'Sallader', '', 'Tuna Salad', 'Tuna with mixed greens and lemon dressing', 'Tonfisk Sallad', 'Tonfisk med blandad sallad och citrondressing', 'سالاد تن ماهی', 'تن ماهی با سبزیجات مخلوط و سس لیمو', 'Thunfischsalat', 'Thunfisch mit gemischtem Salat und Zitronendressing', 'NO', 'NO', 'YES', 'NO', 'NO', 'NO'],
            ['salad-burrata', 139, 'Salads', 'Sallader', '', 'Burrata Salad', 'Creamy burrata with arugula and balsamic', 'Burrata Sallad', 'Krämig burrata med ruccola och balsamico', 'سالاد بوراتا', 'بوراتای خامه‌ای با روکولا و بالزامیک', 'Burrata-Salat', 'Cremige Burrata mit Rucola und Balsamico', 'NO', 'YES', 'YES', 'NO', 'NO', 'NO'],

            // BURGERS (8 items)
            ['burger-classic', 139, 'Burgers', 'Hamburgare', '', 'Classic Burger', 'Beef patty with lettuce, tomato, and special sauce', 'Klassisk Hamburgare', 'Nötköttsburgare med sallad, tomat och specialsås', 'برگر کلاسیک', 'کتلت گوشت گاو با کاهو، گوجه و سس مخصوص', 'Klassischer Burger', 'Rindfleisch-Patty mit Salat, Tomate und Spezialsauce', 'NO', 'NO', 'NO', 'NO', 'YES', 'YES'],
            ['burger-cheese', 149, 'Burgers', 'Hamburgare', '', 'Cheeseburger', 'Beef patty with cheddar cheese', 'Ostburgare', 'Nötköttsburgare med cheddarost', 'چیزبرگر', 'کتلت گوشت گاو با پنیر چدار', 'Cheeseburger', 'Rindfleisch-Patty mit Cheddar-Käse', 'NO', 'NO', 'NO', 'NO', 'YES', 'NO'],
            ['burger-bacon', 159, 'Burgers', 'Hamburgare', '', 'Bacon Burger', 'Beef patty with crispy bacon and cheese', 'Baconburgare', 'Nötköttsburgare med frasig bacon och ost', 'برگر بیکن', 'کتلت گوشت گاو با بیکن کریسپی و پنیر', 'Bacon-Burger', 'Rindfleisch-Patty mit knusprigem Speck und Käse', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['burger-veggie', 139, 'Burgers', 'Hamburgare', '', 'Veggie Burger', 'Plant-based patty with avocado', 'Veganburgare', 'Växtbaserad burgare med avokado', 'برگر گیاهی', 'کتلت گیاهی با آووکادو', 'Veggie-Burger', 'Pflanzenbasiertes Patty mit Avocado', 'NO', 'YES', 'NO', 'YES', 'NO', 'YES'],
            ['burger-chicken', 139, 'Burgers', 'Hamburgare', '', 'Chicken Burger', 'Crispy chicken fillet with mayo', 'Kycklingburgare', 'Frasig kycklingfilé med majonäs', 'برگر مرغ', 'فیله مرغ کریسپی با مایونز', 'Hähnchen-Burger', 'Knuspriges Hähnchenfilet mit Mayo', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['burger-bbq', 159, 'Burgers', 'Hamburgare', '', 'BBQ Burger', 'Beef with BBQ sauce and onion rings', 'BBQ Burgare', 'Nötköttsburgare med BBQ-sås och lökringar', 'برگر باربیکیو', 'گوشت گاو با سس باربیکیو و حلقه پیاز', 'BBQ-Burger', 'Rindfleisch mit BBQ-Sauce und Zwiebelringen', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['burger-double', 179, 'Burgers', 'Hamburgare', '', 'Double Burger', 'Two beef patties with double cheese', 'Dubbelburgare', 'Två köttbiffar med dubbel ost', 'برگر دوبل', 'دو کتلت گوشت با پنیر دوبل', 'Doppel-Burger', 'Zwei Rindfleisch-Patties mit doppeltem Käse', 'NO', 'NO', 'NO', 'NO', 'NO', 'YES'],
            ['burger-fish', 139, 'Burgers', 'Hamburgare', '', 'Fish Burger', 'Crispy fish fillet with tartar sauce', 'Fiskburgare', 'Frasig fiskfilé med tartarsås', 'برگر ماهی', 'فیله ماهی کریسپی با سس تارتار', 'Fisch-Burger', 'Knuspriges Fischfilet mit Remoulade', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],

            // APPETIZERS (7 items)
            ['appetizer-garlic-bread', 59, 'Appetizers', 'Förrätter', '', 'Garlic Bread', 'Toasted bread with garlic butter', 'Vitlöksbröd', 'Rostat bröd med vitlökssmör', 'نان سیر', 'نان تست شده با کره سیر', 'Knoblauchbrot', 'Geröstetes Brot mit Knoblauchbutter', 'NO', 'YES', 'NO', 'NO', 'NO', 'NO'],
            ['appetizer-bruschetta', 79, 'Appetizers', 'Förrätter', '', 'Bruschetta', 'Toasted bread with tomatoes and basil', 'Bruschetta', 'Rostat bröd med tomater och basilika', 'بروسکتا', 'نان تست شده با گوجه و ریحان', 'Bruschetta', 'Geröstetes Brot mit Tomaten und Basilikum', 'NO', 'YES', 'NO', 'YES', 'NO', 'NO'],
            ['appetizer-mozzarella-sticks', 89, 'Appetizers', 'Förrätter', '', 'Mozzarella Sticks', 'Fried mozzarella with marinara sauce', 'Mozzarella Sticks', 'Friterad mozzarella med marinarasås', 'استیک موزارلا', 'موزارلای سرخ شده با سس مارینارا', 'Mozzarella-Sticks', 'Frittierter Mozzarella mit Marinara-Sauce', 'NO', 'YES', 'NO', 'NO', 'NO', 'NO'],
            ['appetizer-calamari', 119, 'Appetizers', 'Förrätter', '', 'Fried Calamari', 'Crispy squid rings with aioli', 'Friterad Calamari', 'Knaprig bläckfisk med aioli', 'کالاماری سرخ شده', 'حلقه‌های ماهی مرکب کریسپی با آیولی', 'Frittierte Calamari', 'Knusprige Tintenfischringe mit Aioli', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'],
            ['appetizer-soup', 79, 'Appetizers', 'Förrätter', '', 'Soup of the Day', 'Fresh homemade soup', 'Dagens Soppa', 'Färsk hemlagad soppa', 'سوپ روز', 'سوپ تازه خانگی', 'Tagessuppe', 'Frische hausgemachte Suppe', 'NO', 'YES', 'YES', 'YES', 'NO', 'NO'],
            ['appetizer-wings', 99, 'Appetizers', 'Förrätter', '', 'Chicken Wings', 'Crispy wings with choice of sauce', 'Kycklingvingar', 'Knapriga vingar med valfri sås', 'بال مرغ', 'بال مرغ کریسپی با سس دلخواه', 'Chicken Wings', 'Knusprige Flügel mit Saucenwahl', 'YES', 'NO', 'YES', 'NO', 'YES', 'NO'],
            ['appetizer-nachos', 109, 'Appetizers', 'Förrätter', '', 'Nachos Supreme', 'Tortilla chips with cheese, jalapeños, and salsa', 'Nachos Supreme', 'Tortillachips med ost, jalapeño och salsa', 'ناچوز مخصوص', 'چیپس تورتیلا با پنیر، خلاپنو و سالسا', 'Nachos Supreme', 'Tortillachips mit Käse, Jalapeños und Salsa', 'YES', 'YES', 'YES', 'NO', 'NO', 'NO'],

            // DESSERTS (5 items)
            ['dessert-tiramisu', 79, 'Desserts', 'Efterrätter', '', 'Tiramisu', 'Classic Italian coffee dessert', 'Tiramisu', 'Klassisk italiensk kaffedessert', 'تیرامیسو', 'دسر قهوه کلاسیک ایتالیایی', 'Tiramisu', 'Klassisches italienisches Kaffeedessert', 'NO', 'YES', 'NO', 'NO', 'YES', 'NO'],
            ['dessert-panna-cotta', 69, 'Desserts', 'Efterrätter', '', 'Panna Cotta', 'Creamy Italian dessert with berry sauce', 'Panna Cotta', 'Krämig italiensk dessert med bärsås', 'پانا کوتا', 'دسر خامه‌ای ایتالیایی با سس توت', 'Panna Cotta', 'Cremiges italienisches Dessert mit Beerensauce', 'NO', 'YES', 'YES', 'NO', 'NO', 'NO'],
            ['dessert-gelato', 59, 'Desserts', 'Efterrätter', '', 'Italian Gelato', 'Three scoops of artisan gelato', 'Italiensk Gelato', 'Tre kulor hantverksgelato', 'جلاتو ایتالیایی', 'سه اسکوپ بستنی ایتالیایی دست‌ساز', 'Italienisches Gelato', 'Drei Kugeln handgemachtes Gelato', 'NO', 'YES', 'YES', 'NO', 'NO', 'NO'],
            ['dessert-chocolate-cake', 79, 'Desserts', 'Efterrätter', '', 'Chocolate Cake', 'Rich dark chocolate cake', 'Chokladkaka', 'Mörk chokladkaka', 'کیک شکلاتی', 'کیک شکلات تلخ غنی', 'Schokoladenkuchen', 'Reichhaltiger dunkler Schokoladenkuchen', 'NO', 'YES', 'NO', 'NO', 'NO', 'YES'],
            ['dessert-cheesecake', 79, 'Desserts', 'Efterrätter', '', 'New York Cheesecake', 'Classic creamy cheesecake', 'New York Cheesecake', 'Klassisk krämig cheesecake', 'چیزکیک نیویورکی', 'چیزکیک خامه‌ای کلاسیک', 'New York Cheesecake', 'Klassischer cremiger Käsekuchen', 'NO', 'YES', 'NO', 'NO', 'NO', 'NO'],

            // DRINKS (5 items)
            ['drink-soda', 35, 'Drinks', 'Drycker', '', 'Soft Drink', 'Choice of Coca-Cola, Fanta, or Sprite', 'Läsk', 'Välj mellan Coca-Cola, Fanta eller Sprite', 'نوشابه', 'انتخاب از کوکاکولا، فانتا یا اسپرایت', 'Softdrink', 'Wahl aus Coca-Cola, Fanta oder Sprite', 'NO', 'YES', 'YES', 'YES', 'NO', 'NO'],
            ['drink-water', 25, 'Drinks', 'Drycker', '', 'Mineral Water', 'Still or sparkling mineral water', 'Mineralvatten', 'Stilla eller kolsyrat mineralvatten', 'آب معدنی', 'آب معدنی ساده یا گازدار', 'Mineralwasser', 'Stilles oder prickelndes Mineralwasser', 'NO', 'YES', 'YES', 'YES', 'NO', 'NO'],
            ['drink-juice', 45, 'Drinks', 'Drycker', '', 'Fresh Juice', 'Orange, apple, or mixed fruit juice', 'Färsk Juice', 'Apelsin, äpple eller blandad fruktjuice', 'آب میوه تازه', 'پرتقال، سیب یا آب میوه مخلوط', 'Frischer Saft', 'Orangen-, Apfel- oder gemischter Fruchtsaft', 'NO', 'YES', 'YES', 'YES', 'NO', 'NO'],
            ['drink-beer', 55, 'Drinks', 'Drycker', '', 'Beer', 'Selection of local and imported beers', 'Öl', 'Urval av lokala och importerade öl', 'آبجو', 'انتخابی از آبجوهای محلی و وارداتی', 'Bier', 'Auswahl an lokalen und importierten Bieren', 'NO', 'YES', 'YES', 'YES', 'NO', 'NO'],
            ['drink-wine', 75, 'Drinks', 'Drycker', '', 'House Wine', 'Glass of red or white house wine', 'Husets Vin', 'Glas rött eller vitt husvin', 'شراب خانگی', 'لیوان شراب قرمز یا سفید خانگی', 'Hauswein', 'Glas Rot- oder Weißwein des Hauses', 'NO', 'YES', 'YES', 'YES', 'NO', 'NO'],
        ];

        const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
        productsSheet['!cols'] = [
            { wch: 26 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
            { wch: 28 }, { wch: 55 }, { wch: 28 }, { wch: 55 },
            { wch: 25 }, { wch: 50 }, { wch: 28 }, { wch: 55 },
            { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
        ];
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

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
