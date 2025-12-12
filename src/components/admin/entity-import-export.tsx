'use client';

import { useState, useRef } from 'react';

interface Props {
    entityName: string; // 'categories' or 'extras'
    exportUrl: string;
    importUrl: string;
    templateUrl: string;
}

export default function EntityImportExport({ entityName, exportUrl, importUrl, templateUrl }: Props) {
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleExport = () => window.location.href = exportUrl;
    const handleTemplate = () => window.location.href = templateUrl;
    const handleImportClick = () => fileRef.current?.click();

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(importUrl, { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok) {
                setResult({ success: true, message: `✅ Imported ${data.imported} of ${data.total} ${entityName}!` });
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setResult({ success: false, message: `❌ ${data.error}` });
            }
        } catch (err: any) {
            setResult({ success: false, message: `❌ ${err.message}` });
        } finally {
            setIsImporting(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const btn = {
        padding: '0.5rem 0.8rem',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.05)',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem'
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" ref={fileRef} onChange={handleFile} accept=".xlsx,.xls" style={{ display: 'none' }} />
            <button onClick={handleExport} style={btn}>📥 Export</button>
            <button onClick={handleTemplate} style={{ ...btn, borderColor: '#10b981' }}>📄 Template</button>
            <button onClick={handleImportClick} disabled={isImporting} style={{ ...btn, opacity: isImporting ? 0.5 : 1 }}>
                {isImporting ? '⏳...' : '📤 Import'}
            </button>
            {result && <span style={{ fontSize: '0.75rem', color: result.success ? '#10b981' : '#ef4444' }}>{result.message}</span>}
        </div>
    );
}
