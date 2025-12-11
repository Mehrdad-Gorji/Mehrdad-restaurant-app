'use client';

import { useState, useEffect } from 'react';
import BackToDashboard from '@/components/admin/back-to-dashboard';

interface Message {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: string;
    reply: string | null;
    createdAt: string;
}

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/contact');
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/contact/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchMessages();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await fetch(`/api/contact/${id}`, { method: 'DELETE' });
            fetchMessages();
            setSelectedMessage(null);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' };
            case 'READ': return { bg: 'rgba(245, 158, 11, 0.2)', text: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' };
            case 'REPLIED': return { bg: 'rgba(16, 185, 129, 0.2)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' };
            default: return { bg: 'rgba(107, 114, 128, 0.2)', text: '#d1d5db', border: 'rgba(107, 114, 128, 0.3)' };
        }
    };

    const getSubjectLabel = (subject: string) => {
        const labels: Record<string, string> = {
            general: 'General Inquiry',
            order: 'Order Related',
            feedback: 'Feedback',
            partnership: 'Business Partnership',
            other: 'Other'
        };
        return labels[subject] || subject;
    };

    if (loading) {
        return <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>Loading messages...</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <BackToDashboard />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem', marginTop: '1rem' }}>
                <div>
                    <h1 style={{
                        marginTop: 0,
                        marginBottom: '0.5rem',
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>✉️ Contact Messages</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>View and reply to customer inquiries.</p>
                </div>
                <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#a5b4fc',
                    fontSize: '0.9rem'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{messages.filter(m => m.status === 'NEW').length}</span> new messages
                </div>
            </div>

            {messages.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.4)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
                    <p style={{ fontSize: '1.2rem' }}>No contact messages yet</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? 'repeat(auto-fit, minmax(350px, 1fr))' : '1fr', gap: '2rem' }}>

                    {/* Messages List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map(msg => {
                            const statusStyles = getStatusColor(msg.status);
                            const isSelected = selectedMessage?.id === msg.id;

                            return (
                                <div
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        if (msg.status === 'NEW') {
                                            updateStatus(msg.id, 'READ');
                                        }
                                    }}
                                    style={{
                                        background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s ease',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                                    onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontWeight: '600', margin: 0, color: '#fff', fontSize: '1.1rem' }}>{msg.name}</h3>
                                            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: '0.25rem 0' }}>{msg.email}</p>
                                        </div>
                                        <span style={{
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: statusStyles.bg,
                                            color: statusStyles.text,
                                            border: `1px solid ${statusStyles.border}`
                                        }}>
                                            {msg.status}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: 'rgba(255,255,255,0.8)',
                                        margin: '0 0 0.75rem 0',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        lineHeight: '1.5'
                                    }}>
                                        <strong style={{ color: '#a5b4fc' }}>{getSubjectLabel(msg.subject)}:</strong> {msg.message}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Message Detail */}
                    {selectedMessage && (
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '24px',
                            padding: '2rem',
                            position: 'sticky',
                            top: '2rem',
                            maxHeight: 'calc(100vh - 100px)',
                            overflow: 'auto',
                            border: '1px solid rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                <div>
                                    <h2 style={{ fontWeight: '700', margin: 0, fontSize: '1.5rem', color: '#fff' }}>{selectedMessage.name}</h2>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>📧 {selectedMessage.email}</p>
                                        {selectedMessage.phone && (
                                            <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>📞 {selectedMessage.phone}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    marginRight: '0.75rem',
                                    fontWeight: '500'
                                }}>
                                    {getSubjectLabel(selectedMessage.subject)}
                                </span>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    background: getStatusColor(selectedMessage.status).bg,
                                    color: getStatusColor(selectedMessage.status).text,
                                    border: `1px solid ${getStatusColor(selectedMessage.status).border}`,
                                    fontWeight: '600'
                                }}>
                                    {selectedMessage.status}
                                </span>
                            </div>

                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                marginBottom: '1rem',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <p style={{ margin: 0, lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem' }}>
                                    {selectedMessage.message}
                                </p>
                            </div>

                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', textAlign: 'right' }}>
                                Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                            </p>

                            {/* Reply Section */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>Reply to User</h3>

                                {selectedMessage.reply ? (
                                    <div style={{
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        padding: '1.5rem',
                                        borderRadius: '16px'
                                    }}>
                                        <p style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>✓</span> Replied
                                        </p>
                                        <p style={{ margin: 0, color: '#d1fae5', lineHeight: '1.6' }}>{selectedMessage.reply}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <textarea
                                            rows={5}
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply here..."
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(255,255,255,0.05)',
                                                fontFamily: 'inherit',
                                                fontSize: '1rem',
                                                color: '#fff',
                                                outline: 'none',
                                                resize: 'vertical'
                                            }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={async () => {
                                                    if (!replyText.trim()) return;
                                                    setSending(true);
                                                    try {
                                                        await fetch(`/api/contact/${selectedMessage.id}`, {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                status: 'REPLIED',
                                                                reply: replyText
                                                            })
                                                        });
                                                        setReplyText('');
                                                        fetchMessages();
                                                        setSelectedMessage({
                                                            ...selectedMessage,
                                                            status: 'REPLIED',
                                                            reply: replyText
                                                        } as any);
                                                    } catch (err) {
                                                        alert('Failed to send reply');
                                                    } finally {
                                                        setSending(false);
                                                    }
                                                }}
                                                disabled={sending}
                                                style={{
                                                    padding: '0.75rem 2rem',
                                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    cursor: sending ? 'not-allowed' : 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                                    opacity: sending ? 0.7 : 1
                                                }}
                                            >
                                                {sending ? 'Sending...' : '📤 Send Reply'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button
                                        onClick={() => deleteMessage(selectedMessage.id)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#fca5a5',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                                    >
                                        🗑️ Delete Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
