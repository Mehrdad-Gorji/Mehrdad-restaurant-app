const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating product and category images...');

    // Update Tiramisu - use a dessert-like image (we'll use salad for now as placeholder)
    await prisma.product.updateMany({
        where: { slug: 'tiramisu' },
        data: { image: '/uploads/products/special.png' }
    });
    console.log('Updated Tiramisu image');

    // Update Carbonara - use pasta-like image
    await prisma.product.updateMany({
        where: { slug: 'carbonara' },
        data: { image: '/uploads/products/vegetarian.png' }
    });
    console.log('Updated Carbonara image');

    // Update Grilled Salmon - use seafood image
    await prisma.product.updateMany({
        where: { slug: 'grilled-salmon' },
        data: { image: '/uploads/products/seafood.png' }
    });
    console.log('Updated Grilled Salmon image');

    // Update category images
    await prisma.category.updateMany({
        where: { slug: 'desserts' },
        data: { image: '/uploads/products/special.png' }
    });
    console.log('Updated Desserts category image');

    await prisma.category.updateMany({
        where: { slug: 'pasta' },
        data: { image: '/uploads/products/vegetarian.png' }
    });
    console.log('Updated Pasta category image');

    await prisma.category.updateMany({
        where: { slug: 'seafood' },
        data: { image: '/uploads/products/seafood.png' }
    });
    console.log('Updated Seafood category image');

    console.log('\nDone! All images updated.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
