const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    const combos = await prisma.combo.findMany({
        select: { id: true, name: true, image: true, items: { include: { product: true } } }
    });
    fs.writeFileSync('combo_dump.json', JSON.stringify(combos, null, 2));
    console.log('Dumped to combo_dump.json');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
