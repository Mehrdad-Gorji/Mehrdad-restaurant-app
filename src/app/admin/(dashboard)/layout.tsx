import { redirect } from 'next/navigation';
import { getAdminSession, isSuperAdmin } from '@/lib/admin-auth';
import AdminLayoutClient from '@/components/admin/admin-layout-client';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const admin = await getAdminSession();

    if (!admin) {
        redirect('/admin/login');
    }

    const showUsersMenu = isSuperAdmin(admin.adminRole);

    return (
        <AdminLayoutClient admin={admin} showUsersMenu={showUsersMenu}>
            {children}
        </AdminLayoutClient>
    );
}
