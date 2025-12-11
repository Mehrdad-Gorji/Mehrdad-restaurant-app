import Link from 'next/link';
import { prisma } from '@/lib/prisma'; // We can fetch order details if we want server side rendering of success, but let's keep it simple

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ orderId: string }> }) {
    const { orderId } = await searchParams;

    return (
        <div className="container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ marginBottom: '1rem' }}>Order Placed Successfully!</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Thank you for your order. Your order ID is <strong style={{ color: 'black' }}>{orderId}</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Link href="/" className="btn btn-secondary">Return Home</Link>
                {/* Link to order tracking if available */}
            </div>
        </div>
    );
}
