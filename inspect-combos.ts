
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const combos = await prisma.combo.findMany();
    console.log('Combos:', JSON.stringify(combos, null, 2));
}

main();
