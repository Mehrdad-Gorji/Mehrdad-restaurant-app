
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'admin'; // Simple password for recovery
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(`Creating/Updating admin user: ${email}`);

    const admin = await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            adminRole: 'SUPER_ADMIN',
            name: 'Super Admin',
            lastSeen: new Date(),
        },
        create: {
            email: email,
            password: hashedPassword,
            role: 'ADMIN',
            adminRole: 'SUPER_ADMIN',
            name: 'Super Admin',
            phone: '',
            lastSeen: new Date(),
        },
    });

    console.log(`Admin user created/updated successfully.`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
