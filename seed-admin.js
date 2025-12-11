// Seed script to create Super Admin user
// Run: node seed-admin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'mehrdadgorji@gmail.com';
    const password = 'm0062190105';
    const name = 'Mehrdad Gorji';

    // Check if already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        // Update to admin if not already
        if (existing.role !== 'ADMIN' || existing.adminRole !== 'SUPER_ADMIN') {
            const hashedPassword = await bcrypt.hash(password, 12);
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'ADMIN',
                    adminRole: 'SUPER_ADMIN',
                    name
                }
            });
            console.log('✅ Updated existing user to Super Admin:', email);
        } else {
            // Update password anyway
            const hashedPassword = await bcrypt.hash(password, 12);
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
            console.log('✅ Super Admin already exists, password updated:', email);
        }
    } else {
        // Create new super admin
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN',
                adminRole: 'SUPER_ADMIN'
            }
        });
        console.log('✅ Created new Super Admin:', email);
    }

    console.log('\n🔑 Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('\n🌐 Login URL: http://localhost:3000/admin/login');
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
