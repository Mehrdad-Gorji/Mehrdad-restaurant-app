import { Suspense } from 'react';
import OrderHistoryClient from '@/components/order-history-client';

export default async function MyOrdersPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            position: 'relative'
        }}>
            {/* Background */}
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                top: '-100px',
                right: '-100px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
                <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem', color: '#fff' }}>Loading...</div>}>
                    <OrderHistoryClient lang={lang} />
                </Suspense>
            </div>
        </div>
    );
}
