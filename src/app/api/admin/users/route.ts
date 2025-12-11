import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminSession, isSuperAdmin } from '@/lib/admin-auth';

export async function GET() {
    const admin = await getAdminSession();
    if (!admin || !isSuperAdmin(admin.adminRole)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            adminRole: true,
            createdAt: true
        }
    });

    return NextResponse.json(admins);
}

export async function POST(request: NextRequest) {
    const admin = await getAdminSession();
    if (!admin || !isSuperAdmin(admin.adminRole)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { name, email, phone, password, adminRole } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newAdmin = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                phone,
                role: 'ADMIN',
                adminRole: adminRole || 'STAFF'
            }
        });

        return NextResponse.json({
            success: true,
            user: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const admin = await getAdminSession();
    if (!admin || !isSuperAdmin(admin.adminRole)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id, name, email, phone, password, adminRole } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email.toLowerCase();
        if (phone !== undefined) data.phone = phone;
        if (adminRole !== undefined) data.adminRole = adminRole;

        // Only hash and update password if provided
        if (password) {
            data.password = await bcrypt.hash(password, 12);
        }

        const updated = await prisma.user.update({
            where: { id },
            data
        });

        return NextResponse.json({
            success: true,
            user: { id: updated.id, email: updated.email, name: updated.name }
        });
    } catch (error) {
        console.error('Update admin error:', error);
        return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const admin = await getAdminSession();
    if (!admin || !isSuperAdmin(admin.adminRole)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === admin.id) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    try {
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
    }
}
