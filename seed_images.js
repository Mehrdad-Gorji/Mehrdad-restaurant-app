const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.product.update({
            where: { slug: 'pizza-margherita-test' },
            data: { image: 'https://placehold.co/400x400/orange/white?text=Pizza' }
        });
        await prisma.product.update({
            where: { slug: 'cola-test' },
            data: { image: 'https://placehold.co/400x400/black/white.png?text=Cola' }
        });
        console.log('Updated test products with images.');
    } catch (e) {
        // Ignore if not found or already updated, just log
        console.error(e.message);
    }
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
