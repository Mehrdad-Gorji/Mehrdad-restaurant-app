const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'admin@pizzashop.se';
    const plainPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            adminRole: 'SUPER_ADMIN'
        },
        create: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
            adminRole: 'SUPER_ADMIN',
            name: 'Admin'
        }
    });

    console.log('✅ Admin user created/updated!');
    console.log('   Email:', email);
    console.log('   Password:', plainPassword);
    console.log('   Role:', admin.adminRole);
}

createAdmin()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
    });
