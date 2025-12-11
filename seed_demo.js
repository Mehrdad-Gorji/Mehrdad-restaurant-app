const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🍕 Seeding Pizza Shop Database...\n');

    // Clear existing data
    await prisma.comboItem.deleteMany();
    await prisma.combo.deleteMany();
    await prisma.productExtra.deleteMany();
    await prisma.productSizeTranslation.deleteMany();
    await prisma.productSize.deleteMany();
    await prisma.productTranslation.deleteMany();
    await prisma.extraTranslation.deleteMany();
    await prisma.extra.deleteMany();
    await prisma.product.deleteMany();
    await prisma.categoryTranslation.deleteMany();
    await prisma.category.deleteMany();

    console.log('✓ Cleared existing data\n');

    // Create Categories
    const pizzaCategory = await prisma.category.create({
        data: {
            slug: 'pizzas',
            image: '/images/products/margherita.png',
            translations: {
                create: [
                    { language: 'sv', name: 'Pizzor' },
                    { language: 'en', name: 'Pizzas' },
                    { language: 'de', name: 'Pizzen' },
                    { language: 'fa', name: 'پیتزا' },
                ]
            }
        }
    });
    console.log('✓ Created Pizza category');

    // Create Extras
    const extras = await Promise.all([
        prisma.extra.create({
            data: {
                price: 15,
                image: null,
                translations: {
                    create: [
                        { language: 'sv', name: 'Extra Ost' },
                        { language: 'en', name: 'Extra Cheese' },
                        { language: 'de', name: 'Extra Käse' },
                        { language: 'fa', name: 'پنیر اضافی' },
                    ]
                }
            }
        }),
        prisma.extra.create({
            data: {
                price: 20,
                image: null,
                translations: {
                    create: [
                        { language: 'sv', name: 'Pepperoni' },
                        { language: 'en', name: 'Pepperoni' },
                        { language: 'de', name: 'Pepperoni' },
                        { language: 'fa', name: 'پپرونی' },
                    ]
                }
            }
        }),
        prisma.extra.create({
            data: {
                price: 15,
                image: null,
                translations: {
                    create: [
                        { language: 'sv', name: 'Champinjoner' },
                        { language: 'en', name: 'Mushrooms' },
                        { language: 'de', name: 'Pilze' },
                        { language: 'fa', name: 'قارچ' },
                    ]
                }
            }
        }),
        prisma.extra.create({
            data: {
                price: 10,
                image: null,
                translations: {
                    create: [
                        { language: 'sv', name: 'Lök' },
                        { language: 'en', name: 'Onions' },
                        { language: 'de', name: 'Zwiebeln' },
                        { language: 'fa', name: 'پیاز' },
                    ]
                }
            }
        }),
        prisma.extra.create({
            data: {
                price: 25,
                image: null,
                translations: {
                    create: [
                        { language: 'sv', name: 'Skinka' },
                        { language: 'en', name: 'Ham' },
                        { language: 'de', name: 'Schinken' },
                        { language: 'fa', name: 'ژامبون' },
                    ]
                }
            }
        }),
        prisma.extra.create({
            data: {
                price: 15,
                image: null,
                translations: {
                    create: [
                        { language: 'sv', name: 'Oliver' },
                        { language: 'en', name: 'Olives' },
                        { language: 'de', name: 'Oliven' },
                        { language: 'fa', name: 'زیتون' },
                    ]
                }
            }
        }),
    ]);
    console.log('✓ Created 6 extras');

    // Create Products (8 Pizzas)
    const products = [
        { slug: 'margherita', price: 95, image: '/images/products/margherita.png', nameSv: 'Margherita', nameEn: 'Margherita', nameDe: 'Margherita', nameFa: 'مارگریتا', descSv: 'Klassisk pizza med tomatsås, mozzarella och färsk basilika', descEn: 'Classic pizza with tomato sauce, mozzarella and fresh basil' },
        { slug: 'pepperoni', price: 115, image: '/images/products/pepperoni.png', nameSv: 'Pepperoni', nameEn: 'Pepperoni', nameDe: 'Pepperoni', nameFa: 'پپرونی', descSv: 'Kryddig pepperoni med smält ost', descEn: 'Spicy pepperoni with melted cheese' },
        { slug: 'hawaiian', price: 110, image: '/images/products/hawaiian.png', nameSv: 'Hawaii', nameEn: 'Hawaiian', nameDe: 'Hawaii', nameFa: 'هاوایی', descSv: 'Skinka och ananas på tomatsås', descEn: 'Ham and pineapple on tomato sauce' },
        { slug: 'vegetarian', price: 105, image: '/images/products/vegetarian.png', nameSv: 'Vegetarisk', nameEn: 'Vegetarian', nameDe: 'Vegetarisch', nameFa: 'سبزیجات', descSv: 'Färska grönsaker och champinjoner', descEn: 'Fresh vegetables and mushrooms' },
        { slug: 'bbq-chicken', price: 125, image: '/images/products/bbq-chicken.png', nameSv: 'BBQ Kyckling', nameEn: 'BBQ Chicken', nameDe: 'BBQ Hähnchen', nameFa: 'مرغ باربیکیو', descSv: 'Grillad kyckling med BBQ-sås', descEn: 'Grilled chicken with BBQ sauce' },
        { slug: 'quattro-formaggi', price: 130, image: '/images/products/quattro-formaggi.png', nameSv: 'Quattro Formaggi', nameEn: 'Quattro Formaggi', nameDe: 'Quattro Formaggi', nameFa: 'کواترو فورماجی', descSv: 'Fyra ostar: mozzarella, gorgonzola, parmesan, fontina', descEn: 'Four cheeses: mozzarella, gorgonzola, parmesan, fontina' },
        { slug: 'seafood', price: 145, image: '/images/products/seafood.png', nameSv: 'Skaldjur', nameEn: 'Seafood', nameDe: 'Meeresfrüchte', nameFa: 'غذای دریایی', descSv: 'Räkor, bläckfisk och musslor', descEn: 'Shrimp, calamari and mussels' },
        { slug: 'special', price: 140, image: '/images/products/special.png', nameSv: 'Husets Special', nameEn: 'House Special', nameDe: 'Hausspezialität', nameFa: 'ویژه خانه', descSv: 'Prosciutto, rucola och parmesanskivor', descEn: 'Prosciutto, arugula and parmesan shavings' },
    ];

    const createdProducts = [];
    for (const p of products) {
        const product = await prisma.product.create({
            data: {
                slug: p.slug,
                price: p.price,
                image: p.image,
                categoryId: pizzaCategory.id,
                translations: {
                    create: [
                        { language: 'sv', name: p.nameSv, description: p.descSv },
                        { language: 'en', name: p.nameEn, description: p.descEn },
                        { language: 'de', name: p.nameDe, description: p.descEn },
                        { language: 'fa', name: p.nameFa, description: p.descEn },
                    ]
                },
                sizes: {
                    create: [
                        { priceModifier: 0, translations: { create: [{ language: 'sv', name: 'Medium' }, { language: 'en', name: 'Medium' }, { language: 'de', name: 'Medium' }, { language: 'fa', name: 'متوسط' }] } },
                        { priceModifier: 30, translations: { create: [{ language: 'sv', name: 'Stor' }, { language: 'en', name: 'Large' }, { language: 'de', name: 'Groß' }, { language: 'fa', name: 'بزرگ' }] } },
                    ]
                }
            }
        });
        createdProducts.push(product);
    }
    console.log('✓ Created 8 pizza products with sizes');

    // Link extras to products
    for (const product of createdProducts) {
        for (const extra of extras) {
            await prisma.productExtra.create({
                data: { productId: product.id, extraId: extra.id }
            });
        }
    }
    console.log('✓ Linked extras to products');

    // Create Combos
    const combos = [
        { name: 'Family Deal', slug: 'family-deal', description: 'Two large pizzas perfect for the whole family', price: 250, discountType: 'PERCENT', discountValue: 15, items: [0, 1] },
        { name: 'Lunch Special', slug: 'lunch-special', description: 'One medium pizza at a special price', price: 85, discountType: 'FIXED', discountValue: 10, items: [0] },
        { name: 'Date Night', slug: 'date-night', description: 'Two medium pizzas for a romantic dinner', price: 180, discountType: 'PERCENT', discountValue: 10, items: [5, 7] },
        { name: 'Party Pack', slug: 'party-pack', description: 'Four large pizzas for your party', price: 450, discountType: 'PERCENT', discountValue: 20, items: [0, 1, 2, 3] },
    ];

    for (const c of combos) {
        await prisma.combo.create({
            data: {
                name: c.name,
                slug: c.slug,
                description: c.description,
                price: c.price,
                discountType: c.discountType,
                discountValue: c.discountValue,
                isActive: true,
                image: createdProducts[c.items[0]].image,
                items: {
                    create: c.items.map((idx, i) => ({
                        productId: createdProducts[idx].id,
                        quantity: 1,
                        sizeName: i === 0 ? 'Large' : 'Medium'
                    }))
                }
            }
        });
    }
    console.log('✓ Created 4 combos');

    console.log('\n🎉 Seeding complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
