'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to delete'}`);
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
                color: '#dc2626',
                padding: '0.5rem',
                background: 'none',
                border: 'none',
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.5 : 1
            }}
        >
            {deleting ? '...' : 'Delete'}
        </button>
    );
}
