
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const combo = await prisma.combo.findFirst();
    if (!combo) {
        console.log('No combo found');
        return;
    }

    console.log('Current combo:', combo.id, combo.name, 'Image:', combo.image);

    try {
        const updated = await prisma.combo.update({
            where: { id: combo.id },
            data: {
                image: '/uploads/test-image.png'
            }
        });
        console.log('Updated combo image:', updated.image);
    } catch (e) {
        console.error('Update failed:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
