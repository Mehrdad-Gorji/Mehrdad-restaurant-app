
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            select: { slug: true, id: true }
        });
        console.log('Product Slugs:', products);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
