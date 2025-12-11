'use client';

import { useState } from 'react';

export default function CopyButton({ code, label }: { code: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="btn"
            style={{
                width: '100%',
                background: copied ? '#22c55e' : '#f3f4f6',
                color: copied ? 'white' : '#1f2937',
                border: 'none',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}
        >
            {copied ? (
                <>
                    <span>✓</span>
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <span>✂️</span>
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}
