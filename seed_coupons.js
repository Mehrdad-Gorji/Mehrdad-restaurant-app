const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🎟️ Adding coupons...\n');

    const coupons = [
        {
            code: 'WELCOME5',
            type: 'PERCENTAGE',
            value: 5,
            minAmount: 100,
            maxUses: 100,
            isActive: true,
            endDate: new Date('2025-12-31'),
        },
        {
            code: 'SAVE10',
            type: 'PERCENTAGE',
            value: 10,
            minAmount: 150,
            maxUses: 50,
            isActive: true,
            endDate: new Date('2025-12-31'),
        },
        {
            code: 'SUPER15',
            type: 'PERCENTAGE',
            value: 15,
            minAmount: 200,
            maxUses: 30,
            isActive: true,
            endDate: new Date('2025-12-31'),
        },
        {
            code: 'MEGA20',
            type: 'PERCENTAGE',
            value: 20,
            minAmount: 300,
            maxDiscount: 100,
            maxUses: 20,
            isActive: true,
            endDate: new Date('2025-12-31'),
        },
        {
            code: 'FLAT50',
            type: 'FIXED',
            value: 50,
            minAmount: 200,
            maxUses: 40,
            isActive: true,
            endDate: new Date('2025-12-31'),
        },
    ];

    for (const c of coupons) {
        await prisma.coupon.create({ data: c });
        console.log(`✓ Created coupon: ${c.code} (${c.type === 'PERCENTAGE' ? c.value + '%' : c.value + ' SEK'})`);
    }

    console.log('\n🎉 All coupons added!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
