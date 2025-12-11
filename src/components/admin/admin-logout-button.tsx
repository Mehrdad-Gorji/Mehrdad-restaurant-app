'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch('/api/admin/auth/logout', { method: 'POST' });
            router.push('/admin/login');
            router.refresh();
        } catch (e) {
            console.error('Logout error:', e);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            style={{
                width: '100%',
                padding: '0.625rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#f87171',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
            }}
        >
            {loading ? '⏳' : '🚪'} {loading ? 'Logging out...' : 'Logout'}
        </button>
    );
}
