
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to create a test combo...');
    try {
        const combo = await prisma.combo.create({
            data: {
                name: 'Debug Combo',
                slug: 'debug-combo-' + Date.now(),
                price: 999,
                image: 'debug.jpg',
                items: {} // No items
            }
        });
        console.log('✅ Success! Created combo:', combo.id);

        // Clean up
        await prisma.combo.delete({ where: { id: combo.id } });
        console.log('✅ Cleaned up test combo.');
    } catch (e: any) {
        console.error('❌ Error creating combo:');
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
