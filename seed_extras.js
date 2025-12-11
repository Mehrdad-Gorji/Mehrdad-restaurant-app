const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧀 Adding 30 extras with images...\n');

    // Delete existing extras and related records
    await prisma.orderItemExtra.deleteMany();
    await prisma.productExtra.deleteMany();
    await prisma.extraTranslation.deleteMany();
    await prisma.extra.deleteMany();
    console.log('✓ Cleared existing extras\n');

    const images = [
        '/uploads/extras/cheese.png',
        '/uploads/extras/pepperoni.png',
        '/uploads/extras/mushrooms.png',
        '/uploads/extras/onions.png',
        '/uploads/extras/olives.png',
    ];

    const extras = [
        { sv: 'Extra Ost', en: 'Extra Cheese', de: 'Extra Käse', fa: 'پنیر اضافی', price: 15, img: 0 },
        { sv: 'Mozzarella', en: 'Mozzarella', de: 'Mozzarella', fa: 'موزارلا', price: 20, img: 0 },
        { sv: 'Cheddar', en: 'Cheddar', de: 'Cheddar', fa: 'چدار', price: 20, img: 0 },
        { sv: 'Parmesan', en: 'Parmesan', de: 'Parmesan', fa: 'پارمزان', price: 25, img: 0 },
        { sv: 'Fetaost', en: 'Feta Cheese', de: 'Fetakäse', fa: 'پنیر فتا', price: 20, img: 0 },
        { sv: 'Pepperoni', en: 'Pepperoni', de: 'Pepperoni', fa: 'پپرونی', price: 25, img: 1 },
        { sv: 'Salami', en: 'Salami', de: 'Salami', fa: 'سالامی', price: 25, img: 1 },
        { sv: 'Skinka', en: 'Ham', de: 'Schinken', fa: 'ژامبون', price: 25, img: 1 },
        { sv: 'Bacon', en: 'Bacon', de: 'Bacon', fa: 'بیکن', price: 30, img: 1 },
        { sv: 'Kyckling', en: 'Chicken', de: 'Hähnchen', fa: 'مرغ', price: 30, img: 1 },
        { sv: 'Köttfärs', en: 'Ground Beef', de: 'Hackfleisch', fa: 'گوشت چرخ‌کرده', price: 30, img: 1 },
        { sv: 'Räkor', en: 'Shrimp', de: 'Garnelen', fa: 'میگو', price: 35, img: 1 },
        { sv: 'Tonfisk', en: 'Tuna', de: 'Thunfisch', fa: 'تن ماهی', price: 30, img: 1 },
        { sv: 'Champinjoner', en: 'Mushrooms', de: 'Pilze', fa: 'قارچ', price: 15, img: 2 },
        { sv: 'Lök', en: 'Onions', de: 'Zwiebeln', fa: 'پیاز', price: 10, img: 3 },
        { sv: 'Rödlök', en: 'Red Onion', de: 'Rote Zwiebel', fa: 'پیاز قرمز', price: 10, img: 3 },
        { sv: 'Paprika', en: 'Bell Pepper', de: 'Paprika', fa: 'فلفل دلمه‌ای', price: 15, img: 2 },
        { sv: 'Jalapeño', en: 'Jalapeño', de: 'Jalapeño', fa: 'فلفل هالاپینو', price: 15, img: 2 },
        { sv: 'Oliver', en: 'Olives', de: 'Oliven', fa: 'زیتون', price: 15, img: 4 },
        { sv: 'Svarta Oliver', en: 'Black Olives', de: 'Schwarze Oliven', fa: 'زیتون سیاه', price: 15, img: 4 },
        { sv: 'Tomater', en: 'Tomatoes', de: 'Tomaten', fa: 'گوجه فرنگی', price: 10, img: 2 },
        { sv: 'Soltorkade Tomater', en: 'Sun-dried Tomatoes', de: 'Getrocknete Tomaten', fa: 'گوجه خشک', price: 20, img: 2 },
        { sv: 'Spenat', en: 'Spinach', de: 'Spinat', fa: 'اسفناج', price: 15, img: 2 },
        { sv: 'Rucola', en: 'Arugula', de: 'Rucola', fa: 'روکولا', price: 15, img: 2 },
        { sv: 'Ananas', en: 'Pineapple', de: 'Ananas', fa: 'آناناس', price: 15, img: 2 },
        { sv: 'Vitlök', en: 'Garlic', de: 'Knoblauch', fa: 'سیر', price: 10, img: 3 },
        { sv: 'Basilika', en: 'Basil', de: 'Basilikum', fa: 'ریحان', price: 10, img: 2 },
        { sv: 'Oregano', en: 'Oregano', de: 'Oregano', fa: 'اورگانو', price: 5, img: 2 },
        { sv: 'BBQ Sås', en: 'BBQ Sauce', de: 'BBQ Soße', fa: 'سس باربیکیو', price: 10, img: 1 },
        { sv: 'Vitlökssås', en: 'Garlic Sauce', de: 'Knoblauchsoße', fa: 'سس سیر', price: 10, img: 0 },
    ];

    const products = await prisma.product.findMany({ select: { id: true } });

    for (const e of extras) {
        const extra = await prisma.extra.create({
            data: {
                price: e.price,
                image: images[e.img],
                translations: {
                    create: [
                        { language: 'sv', name: e.sv },
                        { language: 'en', name: e.en },
                        { language: 'de', name: e.de },
                        { language: 'fa', name: e.fa },
                    ]
                }
            }
        });

        // Link to all products
        for (const product of products) {
            await prisma.productExtra.create({
                data: { productId: product.id, extraId: extra.id }
            });
        }

        console.log(`✓ ${e.en}`);
    }

    console.log('\n🎉 30 extras added with images!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
