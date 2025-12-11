'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BackToDashboard() {
    return (
        <Link
            href="/admin"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#4b5563',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '1.5rem',
                transition: 'all 0.15s'
            }}
        >
            ← Back to Dashboard
        </Link>
    );
}
