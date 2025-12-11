const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Adding 3 new categories with products...');

    // 1. Desserts category
    const desserts = await prisma.category.create({
        data: {
            slug: 'desserts',
            image: '/uploads/categories/desserts.jpg',
            translations: {
                create: [
                    { language: 'en', name: 'Desserts' },
                    { language: 'sv', name: 'Desserter' },
                    { language: 'de', name: 'Desserts' },
                    { language: 'fa', name: 'دسرها' }
                ]
            }
        }
    });
    console.log('Created category: Desserts');

    // 2. Pasta category
    const pasta = await prisma.category.create({
        data: {
            slug: 'pasta',
            image: '/uploads/categories/pasta.jpg',
            translations: {
                create: [
                    { language: 'en', name: 'Pasta' },
                    { language: 'sv', name: 'Pasta' },
                    { language: 'de', name: 'Pasta' },
                    { language: 'fa', name: 'پاستا' }
                ]
            }
        }
    });
    console.log('Created category: Pasta');

    // 3. Seafood category
    const seafood = await prisma.category.create({
        data: {
            slug: 'seafood',
            image: '/uploads/categories/seafood.jpg',
            translations: {
                create: [
                    { language: 'en', name: 'Seafood' },
                    { language: 'sv', name: 'Skaldjur' },
                    { language: 'de', name: 'Meeresfrüchte' },
                    { language: 'fa', name: 'غذاهای دریایی' }
                ]
            }
        }
    });
    console.log('Created category: Seafood');

    // Add a product for each category

    // Dessert product - Tiramisu
    await prisma.product.create({
        data: {
            slug: 'tiramisu',
            price: 79,
            image: '/uploads/products/tiramisu.jpg',
            categoryId: desserts.id,
            translations: {
                create: [
                    { language: 'en', name: 'Tiramisu', description: 'Classic Italian dessert with mascarpone and coffee' },
                    { language: 'sv', name: 'Tiramisu', description: 'Klassisk italiensk dessert med mascarpone och kaffe' },
                    { language: 'de', name: 'Tiramisu', description: 'Klassisches italienisches Dessert mit Mascarpone und Kaffee' },
                    { language: 'fa', name: 'تیرامیسو', description: 'دسر ایتالیایی کلاسیک با ماسکارپونه و قهوه' }
                ]
            }
        }
    });
    console.log('Created product: Tiramisu');

    // Pasta product - Carbonara
    await prisma.product.create({
        data: {
            slug: 'carbonara',
            price: 145,
            image: '/uploads/products/carbonara.jpg',
            categoryId: pasta.id,
            translations: {
                create: [
                    { language: 'en', name: 'Carbonara', description: 'Creamy pasta with bacon, egg and parmesan' },
                    { language: 'sv', name: 'Carbonara', description: 'Krämig pasta med bacon, ägg och parmesan' },
                    { language: 'de', name: 'Carbonara', description: 'Cremige Pasta mit Speck, Ei und Parmesan' },
                    { language: 'fa', name: 'کاربونارا', description: 'پاستا خامه‌ای با بیکن، تخم مرغ و پارمزان' }
                ]
            }
        }
    });
    console.log('Created product: Carbonara');

    // Seafood product - Grilled Salmon
    await prisma.product.create({
        data: {
            slug: 'grilled-salmon',
            price: 189,
            image: '/uploads/products/salmon.jpg',
            categoryId: seafood.id,
            translations: {
                create: [
                    { language: 'en', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with herbs and lemon' },
                    { language: 'sv', name: 'Grillad Lax', description: 'Färsk atlantlax med örter och citron' },
                    { language: 'de', name: 'Gegrillter Lachs', description: 'Frischer Atlantiklachs mit Kräutern und Zitrone' },
                    { language: 'fa', name: 'سالمون گریل شده', description: 'سالمون تازه آتلانتیک با سبزیجات معطر و لیمو' }
                ]
            }
        }
    });
    console.log('Created product: Grilled Salmon');

    console.log('\nDone! Added 3 categories and 3 products.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
