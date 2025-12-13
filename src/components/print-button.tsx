'use client';

interface PrintButtonProps {
    label: string;
}

export default function PrintButton({ label }: PrintButtonProps) {
    return (
        <button
            onClick={() => window.print()}
            style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            🖨️ {label}
        </button>
    );
}
