import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/serialize';
import CustomerList from '@/components/admin/customer-list';

export default async function CustomersPage() {
    const admin = await getAdminSession();

    if (!admin) {
        redirect('/admin/login');
    }

    const customers = await prisma.user.findMany({
        where: { role: 'USER' },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
            _count: {
                select: { orders: true }
            }
        }
    });

    const totalOrders = customers.reduce((sum, c) => sum + c._count.orders, 0);

    return (
        <div style={{ color: '#fff' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    margin: '0',
                    background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    👤 Customers
                </h1>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    View and manage registered customers
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{customers.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Customers</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalOrders}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Orders</div>
                </div>
            </div>

            {/* Customer List */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '1.5rem'
            }}>
                <CustomerList customers={serializePrisma(customers)} />
            </div>
        </div>
    );
}
