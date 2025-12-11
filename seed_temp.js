const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Create a Category
    const category = await prisma.category.create({
        data: {
            slug: 'pizzas-test',
            translations: {
                create: { language: 'en', name: 'Pizzas', description: 'Italian Pizzas' }
            }
        }
    });

    // 2. Create Products
    const p1 = await prisma.product.create({
        data: {
            slug: 'pizza-margherita-test',
            price: 150,
            categoryId: category.id,
            translations: {
                create: { language: 'en', name: 'Margherita Test', description: 'Cheese & Tomato' }
            }
        }
    });
    console.log('Created:', p1.slug);

    const p2 = await prisma.product.create({
        data: {
            slug: 'cola-test',
            price: 20,
            categoryId: category.id,
            translations: {
                create: { language: 'en', name: 'Cola Test', description: 'Cold drink' }
            }
        }
    });
    console.log('Created:', p2.slug);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
