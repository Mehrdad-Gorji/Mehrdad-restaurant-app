const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {
            password: hash,
            adminRole: 'SUPER_ADMIN'
        },
        create: {
            email: 'admin@example.com',
            password: hash,
            name: 'Admin',
            adminRole: 'SUPER_ADMIN',
            role: 'ADMIN'
        }
    });

    console.log('✅ Admin created successfully!');
    console.log('');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
    });
