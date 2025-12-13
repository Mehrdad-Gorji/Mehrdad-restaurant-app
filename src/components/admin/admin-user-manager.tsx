'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    adminRole: string | null;
    lastSeen: string | null;
    workStart: string | null;
    workEnd: string | null;
    createdAt: string;
}

const ADMIN_ROLES = [
    { value: 'SUPER_ADMIN', label: '👑 Super Admin', desc: 'Full access to everything' },
    { value: 'MANAGER', label: '📊 Manager', desc: 'Can manage orders, products, settings' },
    { value: 'STAFF', label: '👤 Staff', desc: 'Can view and manage orders' },
    { value: 'KITCHEN', label: '👨‍🍳 Kitchen', desc: 'Order view only for kitchen display' },
    { value: 'DELIVERY', label: '🚚 Delivery', desc: 'Order view for delivery personnel' }
];

export default function AdminUserManager({ admins, currentAdminId }: { admins: any[], currentAdminId: string }) {
    const isOnline = (lastSeen: string | null) => {
        if (!lastSeen) return false;
        const diff = new Date().getTime() - new Date(lastSeen).getTime();
        return diff < 5 * 60 * 1000; // 5 mins
    };

    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [adminRole, setAdminRole] = useState('STAFF');
    const [workStart, setWorkStart] = useState('');
    const [workEnd, setWorkEnd] = useState('');

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setAdminRole('STAFF');
        setWorkStart('');
        setWorkEnd('');
        setEditingUser(null);
    };

    const openCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEdit = (user: AdminUser) => {
        setEditingUser(user);
        setName(user.name || '');
        setEmail(user.email);
        setPhone(user.phone || '');
        setPassword('');
        setAdminRole(user.adminRole || 'STAFF');
        setWorkStart(user.workStart || '');
        setWorkEnd(user.workEnd || '');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!editingUser && !password) {
                alert('Password is required for new users');
                setLoading(false);
                return;
            }

            const payload = {
                id: editingUser?.id,
                name,
                email,
                phone,
                password: password || undefined,
                adminRole,
                workStart: workStart || null,
                workEnd: workEnd || null
            };

            const res = await fetch('/api/admin/users', {
                method: editingUser ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.refresh();
                setIsModalOpen(false);
                resetForm();
            } else {
                const err = await res.json();
                alert('Error: ' + (err.error || 'Failed to save'));
            }
        } catch (e) {
            alert('An error occurred');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (id === currentAdminId) {
            alert('You cannot delete your own account');
            return;
        }
        if (!confirm('Delete this admin user? This cannot be undone.')) return;

        try {
            await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            router.refresh();
        } catch (e) {
            alert('Failed to delete');
        }
    };

    const getRoleBadge = (role: string | null) => {
        const roleInfo = ADMIN_ROLES.find(r => r.value === role);
        return roleInfo?.label || '❓ Unknown';
    };

    return (
        <div style={{ paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button
                    onClick={openCreate}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>+</span> Add Admin User
                </button>
            </div>

            {/* Users Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {admins.map((user) => (
                    <div key={user.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: user.id === currentAdminId ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        position: 'relative',
                        backdropFilter: 'blur(10px)',
                        boxShadow: user.id === currentAdminId ? '0 0 0 1px rgba(99, 102, 241, 0.3)' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                flexShrink: 0
                            }}>
                                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'No Name'}</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                            </div>
                            {user.id === currentAdminId && (
                                <span style={{
                                    background: '#4f46e5',
                                    color: 'white',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>You</span>
                            )}
                            {isOnline(user.lastSeen) && (
                                <span style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
                                }}>Online</span>
                            )}
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            padding: '0.75rem 1rem',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ display: 'block', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem', color: '#fff' }}>
                                {getRoleBadge(user.adminRole)}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                {ADMIN_ROLES.find(r => r.value === user.adminRole)?.desc || ''}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>
                            {user.phone && <span>📞 {user.phone}</span>}
                            <span>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button onClick={() => openEdit(user)} style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#e5e7eb',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}>
                                ✏️ Edit
                            </button>
                            {user.id !== currentAdminId && (
                                <button onClick={() => handleDelete(user.id)} style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}>
                                    🗑️ Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {admins.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👥</span>
                        <p>No admin users found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1rem'
                }} onClick={() => setIsModalOpen(false)}>
                    <div style={{
                        background: '#1f2937',
                        borderRadius: '24px',
                        width: '100%', maxWidth: '520px',
                        maxHeight: '90vh', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                padding: '1.5rem',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                            }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '2rem' }}>👤</span>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{editingUser ? 'Edit Admin User' : 'Add Admin User'}</h3>
                                        <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Configure access and permissions</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    lineHeight: '1'
                                }}>×</button>
                            </div>

                            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
                                    <input
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="John Doe"
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: '0.5rem' }}>Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="admin@example.com"
                                            style={{
                                                width: '100%', padding: '0.75rem 1rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: '0.5rem' }}>Phone</label>
                                        <input
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="+46 70..."
                                            style={{
                                                width: '100%', padding: '0.75rem 1rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        {editingUser ? 'New Password (leave empty to keep)' : 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: '0.5rem' }}>Working Hours (Optional)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Start Time</label>
                                            <input
                                                type="time"
                                                value={workStart}
                                                onChange={e => setWorkStart(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '0.75rem 1rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>End Time</label>
                                            <input
                                                type="time"
                                                value={workEnd}
                                                onChange={e => setWorkEnd(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '0.75rem 1rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                                        Leave empty for 24/7 access. Access will be denied outside these hours.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: '0.5rem' }}>Admin Role</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {ADMIN_ROLES.map(role => (
                                            <label
                                                key={role.value}
                                                style={{
                                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                                    padding: '0.875rem 1rem',
                                                    border: adminRole === role.value ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    background: adminRole === role.value ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="adminRole"
                                                    value={role.value}
                                                    checked={adminRole === role.value}
                                                    onChange={e => setAdminRole(e.target.value)}
                                                    style={{ marginTop: '0.25rem', accentColor: '#6366f1' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ display: 'block', fontWeight: '600', marginBottom: '0.15rem', color: '#fff' }}>{role.label}</span>
                                                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{role.desc}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem',
                                borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)'
                            }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{
                                    flex: 1, padding: '0.875rem',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                    background: 'transparent', color: 'rgba(255,255,255,0.7)',
                                    fontSize: '1rem', cursor: 'pointer', fontWeight: '600'
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} style={{
                                    flex: 2, padding: '0.875rem',
                                    border: 'none', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                                    fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                                }}>
                                    {loading ? '⏳ Saving...' : (editingUser ? '✓ Update User' : '✓ Create User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
