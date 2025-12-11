'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to update status');
                setStatus(currentStatus); // revert
            }
        } catch (err) {
            console.error(err);
            alert('Error updating status');
            setStatus(currentStatus);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'PENDING': return '#FCD34D'; // yellow
            case 'PAID': return '#60A5FA'; // blue
            case 'PREPARING': return '#F59E0B'; // amber
            case 'DELIVERING': return '#8B5CF6'; // purple
            case 'COMPLETED': return '#10B981'; // green
            case 'CANCELLED': return '#EF4444'; // red
            default: return '#E5E7EB';
        }
    };

    return (
        <select
            value={status}
            onChange={handleChange}
            disabled={loading}
            style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '50px',
                border: '1px solid #ddd',
                backgroundColor: getStatusColor(status),
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem'
            }}
        >
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="PREPARING">PREPARING</option>
            <option value="DELIVERING">DELIVERING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
        </select>
    );
}
