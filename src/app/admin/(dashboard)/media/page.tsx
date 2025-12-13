'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();

    const fetchMedia = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/media?page=${pageNum}&limit=20`);
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/media?id=${id}`, {
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Media Library</h1>
                <label className={`btn btn-primary cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? 'Uploading...' : 'Upload New Image'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading media...</div>
            ) : media.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No images found. Upload your first one!</div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: '0.75rem',
                        marginTop: '1rem'
                    }}>
                        {media.map((item) => (
                            <div key={item.id} style={{
                                aspectRatio: '1/1',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: '#f9fafb'
                            }} className="group">
                                {/* Image Container */}
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <img
                                        src={item.url}
                                        alt={item.filename}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0
                                        }}
                                    />
                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => copyToClipboard(item.url)}
                                            className="p-1.5 bg-white rounded-full hover:bg-gray-100 shadow-sm"
                                            title="Copy URL"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 bg-white rounded-full hover:bg-red-50 text-red-600 shadow-sm"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    {/* Filename Overlay (optional, maybe at bottom) */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] truncate px-1 py-0.5 pointer-events-none">
                                        {item.filename}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-sm btn-ghost"
                            >
                                Previous
                            </button>
                            <span className="flex items-center px-4">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-sm btn-ghost"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
