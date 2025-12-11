import { redirect } from 'next/navigation';
import { getAdminSession, isSuperAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import AdminUserManager from '@/components/admin/admin-user-manager';
import { serializePrisma } from '@/lib/serialize';
import BackToDashboard from '@/components/admin/back-to-dashboard';

export default async function AdminUsersPage() {
    const admin = await getAdminSession();

    if (!admin) {
        redirect('/admin/login');
    }

    // Only super admins can manage other admins
    if (!isSuperAdmin(admin.adminRole)) {
        redirect('/admin');
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

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <BackToDashboard />
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    marginTop: 0,
                    marginBottom: '0.5rem',
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    🛡️ Admin Users
                </h1>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
                    Manage admin team members and their permissions
                </p>
            </div>

            <AdminUserManager
                admins={serializePrisma(admins)}
                currentAdminId={admin.id}
            />
        </div>
    );
}
