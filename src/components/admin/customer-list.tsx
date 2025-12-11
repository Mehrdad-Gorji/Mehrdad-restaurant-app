'use client';

import { useState } from 'react';

interface Customer {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    createdAt: string;
    _count: { orders: number };
}

export default function CustomerList({ customers }: { customers: any[] }) {
    const [search, setSearch] = useState('');

    const filtered = customers.filter(c =>
        (c.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search)
    );

    return (
        <div>
            {/* Header with Search */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <h3 style={{
                    margin: 0,
                    fontWeight: '700',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span>👤</span> Customer List
                </h3>
                <input
                    type="text"
                    placeholder="🔍 Search by name, email, or phone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        minWidth: '280px',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Customer Cards */}
            {filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                    {search ? 'No customers found matching your search' : 'No customers registered yet'}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filtered.map(customer => (
                        <div
                            key={customer.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '14px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                flexWrap: 'wrap'
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: '42px',
                                height: '42px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '1rem',
                                color: '#fff',
                                flexShrink: 0
                            }}>
                                {customer.name?.charAt(0).toUpperCase() || customer.email.charAt(0).toUpperCase()}
                            </div>

                            {/* Name & Email */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ fontWeight: '600', color: '#fff' }}>
                                    {customer.name || 'No Name'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                    {customer.email}
                                </div>
                            </div>

                            {/* Phone */}
                            <div style={{
                                minWidth: '120px',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '0.9rem'
                            }}>
                                {customer.phone || '—'}
                            </div>

                            {/* Orders Badge */}
                            <div style={{ minWidth: '80px' }}>
                                <span style={{
                                    padding: '0.3rem 0.75rem',
                                    borderRadius: '50px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    background: customer._count.orders > 0
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: customer._count.orders > 0
                                        ? '#10b981'
                                        : 'rgba(255,255,255,0.4)'
                                }}>
                                    {customer._count.orders} orders
                                </span>
                            </div>

                            {/* Joined Date */}
                            <div style={{
                                minWidth: '100px',
                                fontSize: '0.85rem',
                                color: 'rgba(255,255,255,0.4)'
                            }}>
                                {new Date(customer.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
