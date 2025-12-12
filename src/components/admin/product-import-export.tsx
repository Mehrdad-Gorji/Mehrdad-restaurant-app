'use client';

import { useState, useRef } from 'react';

export default function ProductImportExport() {
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        // Trigger download
        window.location.href = '/api/admin/products/export';
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/products/import', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setImportResult({
                    success: true,
                    message: `✅ Imported ${data.imported} of ${data.total} products successfully!`
                });
                // Refresh page after 2 seconds
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setImportResult({
                    success: false,
                    message: `❌ Import failed: ${data.error}`
                });
            }
        } catch (error: any) {
            setImportResult({
                success: false,
                message: `❌ Error: ${error.message}`
            });
        } finally {
            setIsImporting(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const buttonStyle = {
        padding: '0.6rem 1rem',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.05)',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'all 0.2s'
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
            />

            {/* Export Button */}
            <button onClick={handleExport} style={buttonStyle}>
                📥 Export
            </button>

            {/* Import Button */}
            <button
                onClick={handleImportClick}
                disabled={isImporting}
                style={{
                    ...buttonStyle,
                    opacity: isImporting ? 0.5 : 1
                }}
            >
                {isImporting ? '⏳ Importing...' : '📤 Import'}
            </button>

            {/* Result Message */}
            {importResult && (
                <span style={{
                    fontSize: '0.8rem',
                    color: importResult.success ? '#10b981' : '#ef4444',
                    marginLeft: '0.5rem'
                }}>
                    {importResult.message}
                </span>
            )}
        </div>
    );
}
