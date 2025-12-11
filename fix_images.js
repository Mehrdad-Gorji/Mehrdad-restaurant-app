const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Update products
    const products = await prisma.product.findMany();
    for (const p of products) {
        if (p.image && p.image.startsWith('/images/')) {
            await prisma.product.update({
                where: { id: p.id },
                data: { image: p.image.replace('/images/', '/uploads/') }
            });
            console.log(`Updated ${p.slug}`);
        }
    }

    // Update categories
    const categories = await prisma.category.findMany();
    for (const c of categories) {
        if (c.image && c.image.startsWith('/images/')) {
            await prisma.category.update({
                where: { id: c.id },
                data: { image: c.image.replace('/images/', '/uploads/') }
            });
            console.log(`Updated category ${c.slug}`);
        }
    }

    // Update combos
    const combos = await prisma.combo.findMany();
    for (const c of combos) {
        if (c.image && c.image.startsWith('/images/')) {
            await prisma.combo.update({
                where: { id: c.id },
                data: { image: c.image.replace('/images/', '/uploads/') }
            });
            console.log(`Updated combo ${c.slug}`);
        }
    }

    console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
