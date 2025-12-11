import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

function getStatusColor(status: string) {
    switch (status) {
        case 'NEW': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
        case 'READ': return { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' };
        case 'REPLIED': return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
        default: return { bg: 'rgba(107, 114, 128, 0.2)', text: '#9ca3af' };
    }
}

export default async function MessagesPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const user = await getSessionUser();

    if (!user) {
        redirect(`/${lang}/login`);
    }

    // @ts-ignore
    const messages = await prisma.contactMessage.findMany({
        where: {
            OR: [
                { userId: user.id },
                { email: user.email }
            ]
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            position: 'relative',
            paddingTop: '2rem',
            paddingBottom: '4rem'
        }}>
            {/* Background Orbs */}
            <div style={{
                position: 'fixed',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link href={`/${lang}/dashboard`} style={{
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        ← {lang === 'fa' ? 'بازگشت به داشبورد' : 'Back to Dashboard'}
                    </Link>
                    <h1 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        ✉️ {lang === 'fa' ? 'پیام‌های من' : 'My Messages'}
                    </h1>
                </div>

                {messages.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '4rem 2rem',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>
                            {lang === 'fa' ? 'پیامی ندارید' : 'No messages yet'}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
                            {lang === 'fa' ? 'اگر سوالی دارید با ما تماس بگیرید' : 'Contact us if you have any questions'}
                        </p>
                        <Link href={`/${lang}/contact`} style={{
                            display: 'inline-block',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                            borderRadius: '50px',
                            color: '#fff',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}>
                            {lang === 'fa' ? 'تماس با ما' : 'Contact Us'}
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg: any) => {
                            const statusColors = getStatusColor(msg.status);
                            return (
                                <div key={msg.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '20px',
                                    padding: '1.5rem',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                                                {msg.subject}
                                            </h3>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '50px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            background: statusColors.bg,
                                            color: statusColors.text
                                        }}>
                                            {msg.status}
                                        </span>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        color: '#e5e7eb',
                                        marginBottom: msg.reply ? '1.5rem' : '0'
                                    }}>
                                        {msg.message}
                                    </div>

                                    {msg.reply && (
                                        <div style={{
                                            borderLeft: '3px solid #22c55e',
                                            paddingLeft: '1rem',
                                            marginLeft: '0.5rem'
                                        }}>
                                            <div style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                ↪️ {lang === 'fa' ? 'پاسخ ادمین' : 'Admin Reply'}
                                                <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '0.5rem', fontWeight: '400' }}>
                                                    {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString() : ''}
                                                </span>
                                            </div>
                                            <div style={{ color: '#d1d5db', lineHeight: '1.6' }}>
                                                {msg.reply}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
