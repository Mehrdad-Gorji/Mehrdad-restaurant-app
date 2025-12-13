'use client';

import { useState, useEffect } from 'react';

interface MediaItem {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const fetchMedia = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/media?page=${pageNum}&limit=50`);
            const data = await res.json();
            if (data.data) {
                setMedia(data.data);
                setTotalPages(data.pagination.pages);
                setPage(data.pagination.page);
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia(page);
    }, [page]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/media', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            // Refresh list
            fetchMedia(1);
        } catch (error) {
            alert('Upload failed: ' + (error as Error).message);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this image? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Delete failed');

            fetchMedia(page);
        } catch (error) {
            alert('Delete failed: ' + (error as Error).message);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                }}>
                    📷 Media Library
                </h1>
                <label style={{
                    backgroundColor: '#8B5CF6',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}>
                    {uploading ? '⏳ Uploading...' : '➕ Upload New Image'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                </label>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                    ⏳ Loading media...
                </div>
            ) : media.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                    📭 No images found. Upload your first one!
                </div>
            ) : (
                <>
                    {/* Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '16px'
                    }}>
                        {media.map((item) => {
                            const isHovered = hoveredId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    onMouseEnter={() => setHoveredId(item.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => copyToClipboard(item.url)}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1/1',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: isHovered ? '3px solid #8B5CF6' : '2px solid #e5e7eb',
                                        boxShadow: isHovered
                                            ? '0 10px 25px rgba(139, 92, 246, 0.3)'
                                            : '0 2px 8px rgba(0,0,0,0.08)',
                                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {/* Image */}
                                    <img
                                        src={item.url}
                                        alt={item.filename}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />

                                    {/* Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: isHovered ? 'rgba(0,0,0,0.5)' : 'transparent',
                                        transition: 'background-color 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        padding: '8px'
                                    }}>
                                        {/* Top Actions */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '6px',
                                            opacity: isHovered ? 1 : 0,
                                            transition: 'opacity 0.2s'
                                        }}>
                                            {/* Copy Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(item.url);
                                                }}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '16px',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                                }}
                                                title="Copy URL"
                                            >
                                                📋
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => handleDelete(item.id, e)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#FEE2E2',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '16px',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                                }}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        {/* Bottom Filename */}
                                        <div style={{
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            fontSize: '10px',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            opacity: isHovered ? 1 : 0,
                                            transition: 'opacity 0.2s',
                                            textAlign: 'center'
                                        }}>
                                            {item.filename}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '12px',
                            marginTop: '32px'
                        }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: page === 1 ? '#f3f4f6' : 'white',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                                    color: page === 1 ? '#9ca3af' : '#374151'
                                }}
                            >
                                ← Previous
                            </button>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 16px',
                                color: '#6b7280'
                            }}>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: page === totalPages ? '#f3f4f6' : 'white',
                                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                    color: page === totalPages ? '#9ca3af' : '#374151'
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
