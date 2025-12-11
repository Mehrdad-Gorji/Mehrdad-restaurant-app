
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            include: {
                translations: true
            }
        });
        console.log("Checking products...");
        products.forEach(p => {
            const name = p.translations.find(t => t.language === 'en')?.name || 'No EN Name';
            console.log(`Product ID: ${p.id}, Slug: '${p.slug}', Name (EN): '${name}'`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
