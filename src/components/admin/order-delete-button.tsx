'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderDeleteButton({ orderId }: { orderId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete order');
            }
        } catch (error) {
            alert('Error deleting order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            style={{
                padding: '0.4rem 0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500'
            }}
        >
            {loading ? '...' : '🗑️ Delete'}
        </button>
    );
}
