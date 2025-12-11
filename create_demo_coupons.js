const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find the most recent user (likely the one you are logged in as)
    const user = await prisma.user.findFirst({
        orderBy: { updatedAt: 'desc' }
    });

    if (!user) {
        console.log('❌ No user found in database.');
        return;
    }

    console.log(`👤 Found user: ${user.name || 'User'} (${user.email})`);
    console.log('🎟️ Creating 4 demo coupons to showcase all designs...');

    const demoCoupons = [
        { code: 'DESIGN_TICKET', value: 15, type: 'PERCENTAGE', minAmount: 100 },
        { code: 'DESIGN_GLASS', value: 50, type: 'FIXED_AMOUNT', minAmount: 200 },
        { code: 'DESIGN_LUXE', value: 25, type: 'PERCENTAGE', maxDiscount: 500 },
        { code: 'DESIGN_NEON', value: 100, type: 'FIXED_AMOUNT', minAmount: 500 },
    ];

    for (const coupon of demoCoupons) {
        // Delete if exists to avoid collision
        await prisma.coupon.deleteMany({ where: { code: coupon.code } });

        await prisma.coupon.create({
            data: {
                code: coupon.code,
                value: coupon.value,
                type: coupon.type,
                minAmount: coupon.minAmount,
                isActive: true,
                maxDiscount: coupon.maxDiscount,
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Valid for 1 year
                allowedUsers: {
                    connect: { id: user.id }
                }
            }
        });
    }

    console.log('✅ 4 Coupons created successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
