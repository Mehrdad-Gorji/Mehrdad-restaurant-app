const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'mehrdadgorji@gmail.com';
    const password = 'admin123'; // رمز عبور - بعداً تغییر دهید!
    const name = 'Mehrdad Gorji';

    try {
        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            console.log('⚠️ User already exists. Updating to admin...');
            const updated = await prisma.user.update({
                where: { email },
                data: {
                    role: 'ADMIN',
                    adminRole: 'SUPER_ADMIN',
                    password: await bcrypt.hash(password, 12)
                }
            });
            console.log('✅ User updated to admin:', updated.email);
        } else {
            // Create new admin
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'ADMIN',
                    adminRole: 'SUPER_ADMIN'
                }
            });
            console.log('✅ Admin created:', user.email);
        }

        console.log('\n🔐 Login credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('\n⚠️ Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
