import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
    adminRole: string | null;
}

export async function getAdminSession(): Promise<AdminUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; adminRole: string };

        if (decoded.role !== 'ADMIN') {
            return null;
        }

        // Verify user still exists and is still admin
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true, adminRole: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return null;
        }

        return user;
    } catch (error) {
        return null;
    }
}

// Permission checking
export const ADMIN_PERMISSIONS = {
    SUPER_ADMIN: ['*'], // All permissions
    MANAGER: ['orders', 'products', 'categories', 'extras', 'combos', 'offers', 'coupons', 'delivery', 'settings', 'users'],
    STAFF: ['orders', 'products'],
    KITCHEN: ['orders'],
    DELIVERY: ['orders']
};

export function hasPermission(adminRole: string | null, permission: string): boolean {
    if (!adminRole) return false;

    const permissions = ADMIN_PERMISSIONS[adminRole as keyof typeof ADMIN_PERMISSIONS];
    if (!permissions) return false;

    return permissions.includes('*') || permissions.includes(permission);
}

export function isSuperAdmin(adminRole: string | null): boolean {
    return adminRole === 'SUPER_ADMIN';
}
