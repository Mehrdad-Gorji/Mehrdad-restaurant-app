const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🍔 Adding more categories and products...\n');

    // Create Drinks Category
    const drinksCategory = await prisma.category.create({
        data: {
            slug: 'drinks',
            image: '/uploads/products/cola.png',
            translations: {
                create: [
                    { language: 'sv', name: 'Drycker' },
                    { language: 'en', name: 'Drinks' },
                    { language: 'de', name: 'Getränke' },
                    { language: 'fa', name: 'نوشیدنی‌ها' },
                ]
            }
        }
    });
    console.log('✓ Created Drinks category');

    // Create Burgers Category
    const burgersCategory = await prisma.category.create({
        data: {
            slug: 'burgers',
            image: '/uploads/products/burger-classic.png',
            translations: {
                create: [
                    { language: 'sv', name: 'Hamburgare' },
                    { language: 'en', name: 'Burgers' },
                    { language: 'de', name: 'Burger' },
                    { language: 'fa', name: 'همبرگر' },
                ]
            }
        }
    });
    console.log('✓ Created Burgers category');

    // Create Salads Category
    const saladsCategory = await prisma.category.create({
        data: {
            slug: 'salads',
            image: '/uploads/products/salad-caesar.png',
            translations: {
                create: [
                    { language: 'sv', name: 'Sallader' },
                    { language: 'en', name: 'Salads' },
                    { language: 'de', name: 'Salate' },
                    { language: 'fa', name: 'سالاد' },
                ]
            }
        }
    });
    console.log('✓ Created Salads category');

    // Create Sides Category
    const sidesCategory = await prisma.category.create({
        data: {
            slug: 'sides',
            image: '/uploads/products/fries.png',
            translations: {
                create: [
                    { language: 'sv', name: 'Tillbehör' },
                    { language: 'en', name: 'Sides' },
                    { language: 'de', name: 'Beilagen' },
                    { language: 'fa', name: 'مخلفات' },
                ]
            }
        }
    });
    console.log('✓ Created Sides category');

    // Create Drinks Products
    const drinks = [
        { slug: 'cola', price: 25, image: '/uploads/products/cola.png', nameSv: 'Coca-Cola', nameEn: 'Coca-Cola', nameDe: 'Coca-Cola', nameFa: 'کوکاکولا', descSv: 'Iskall klassisk cola', descEn: 'Ice-cold classic cola' },
        { slug: 'fanta', price: 25, image: '/uploads/products/fanta.png', nameSv: 'Fanta', nameEn: 'Fanta Orange', nameDe: 'Fanta Orange', nameFa: 'فانتا پرتقالی', descSv: 'Uppfriskande apelsinläsk', descEn: 'Refreshing orange soda' },
    ];

    for (const p of drinks) {
        await prisma.product.create({
            data: {
                slug: p.slug,
                price: p.price,
                image: p.image,
                categoryId: drinksCategory.id,
                translations: {
                    create: [
                        { language: 'sv', name: p.nameSv, description: p.descSv },
                        { language: 'en', name: p.nameEn, description: p.descEn },
                        { language: 'de', name: p.nameDe, description: p.descEn },
                        { language: 'fa', name: p.nameFa, description: p.descEn },
                    ]
                }
            }
        });
    }
    console.log('✓ Created 2 drink products');

    // Create Burger Products
    const burgers = [
        { slug: 'classic-burger', price: 95, image: '/uploads/products/burger-classic.png', nameSv: 'Klassisk Hamburgare', nameEn: 'Classic Burger', nameDe: 'Klassischer Burger', nameFa: 'همبرگر کلاسیک', descSv: 'Nötfärsburgare med sallad, tomat och lök', descEn: 'Beef burger with lettuce, tomato and onion' },
        { slug: 'cheese-burger', price: 110, image: '/uploads/products/burger-cheese.png', nameSv: 'Ostburgare', nameEn: 'Cheese Burger', nameDe: 'Cheeseburger', nameFa: 'چیزبرگر', descSv: 'Dubbel ostburgare med bacon och pickles', descEn: 'Double cheeseburger with bacon and pickles' },
    ];

    for (const p of burgers) {
        await prisma.product.create({
            data: {
                slug: p.slug,
                price: p.price,
                image: p.image,
                categoryId: burgersCategory.id,
                translations: {
                    create: [
                        { language: 'sv', name: p.nameSv, description: p.descSv },
                        { language: 'en', name: p.nameEn, description: p.descEn },
                        { language: 'de', name: p.nameDe, description: p.descEn },
                        { language: 'fa', name: p.nameFa, description: p.descEn },
                    ]
                }
            }
        });
    }
    console.log('✓ Created 2 burger products');

    // Create Salad Products
    const salads = [
        { slug: 'caesar-salad', price: 85, image: '/uploads/products/salad-caesar.png', nameSv: 'Caesar Sallad', nameEn: 'Caesar Salad', nameDe: 'Caesar Salat', nameFa: 'سالاد سزار', descSv: 'Romansallad med parmesan och krutonger', descEn: 'Romaine lettuce with parmesan and croutons' },
        { slug: 'greek-salad', price: 80, image: '/uploads/products/salad-greek.png', nameSv: 'Grekisk Sallad', nameEn: 'Greek Salad', nameDe: 'Griechischer Salat', nameFa: 'سالاد یونانی', descSv: 'Färsk sallad med fetaost och oliver', descEn: 'Fresh salad with feta cheese and olives' },
    ];

    for (const p of salads) {
        await prisma.product.create({
            data: {
                slug: p.slug,
                price: p.price,
                image: p.image,
                categoryId: saladsCategory.id,
                translations: {
                    create: [
                        { language: 'sv', name: p.nameSv, description: p.descSv },
                        { language: 'en', name: p.nameEn, description: p.descEn },
                        { language: 'de', name: p.nameDe, description: p.descEn },
                        { language: 'fa', name: p.nameFa, description: p.descEn },
                    ]
                }
            }
        });
    }
    console.log('✓ Created 2 salad products');

    // Create Sides Products
    const sides = [
        { slug: 'french-fries', price: 35, image: '/uploads/products/fries.png', nameSv: 'Pommes Frites', nameEn: 'French Fries', nameDe: 'Pommes Frites', nameFa: 'سیب‌زمینی سرخ‌کرده', descSv: 'Krispiga pommes frites', descEn: 'Crispy golden french fries' },
        { slug: 'onion-rings', price: 45, image: '/uploads/products/onion-rings.png', nameSv: 'Lökringar', nameEn: 'Onion Rings', nameDe: 'Zwiebelringe', nameFa: 'حلقه پیاز', descSv: 'Krispiga lökringar med dipsås', descEn: 'Crispy onion rings with dipping sauce' },
    ];

    for (const p of sides) {
        await prisma.product.create({
            data: {
                slug: p.slug,
                price: p.price,
                image: p.image,
                categoryId: sidesCategory.id,
                translations: {
                    create: [
                        { language: 'sv', name: p.nameSv, description: p.descSv },
                        { language: 'en', name: p.nameEn, description: p.descEn },
                        { language: 'de', name: p.nameDe, description: p.descEn },
                        { language: 'fa', name: p.nameFa, description: p.descEn },
                    ]
                }
            }
        });
    }
    console.log('✓ Created 2 sides products');

    console.log('\n🎉 All new categories and products added!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
