'use client';

import { useState, useEffect } from 'react';

interface Props {
    value: string;
    onChange: (url: string) => void;
}

interface MediaItem {
    id: string;
    url: string;
    filename: string;
}

export default function ImageUpload({ value, onChange }: Props) {
    const [tab, setTab] = useState<'upload' | 'library'>('upload');
    const [uploading, setUploading] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Library state
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [libraryPage, setLibraryPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log('📁 ImageUpload - File selected:', file?.name);
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/media', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await res.json();
            console.log('✅ ImageUpload - Success:', data.url);
            onChange(data.url);
        } catch (error) {
            console.error('❌ ImageUpload - Error:', error);
            alert('Failed to upload image: ' + (error as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const fetchLibrary = async (page: number) => {
        setLoadingLibrary(true);
        try {
            const res = await fetch(`/api/admin/media?page=${page}&limit=20`);
            const data = await res.json();
            if (data.data) {
                setMediaItems(data.data);
                setTotalPages(data.pagination.pages);
                setLibraryPage(data.pagination.page);
            }
        } catch (error) {
            console.error('Failed to load library:', error);
        } finally {
            setLoadingLibrary(false);
        }
    };

    useEffect(() => {
        if (tab === 'library') {
            fetchLibrary(libraryPage);
        }
    }, [tab, libraryPage]);

    const tabStyle = (isActive: boolean) => ({
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: isActive ? '600' : '400',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: isActive ? '#8B5CF6' : 'transparent',
        color: isActive ? 'white' : '#9ca3af',
        transition: 'all 0.2s'
    });

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#1f2937',
            border: '1px solid #374151'
        }}>
            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid #374151',
                paddingBottom: '12px'
            }}>
                <button
                    type="button"
                    onClick={() => setTab('upload')}
                    style={tabStyle(tab === 'upload')}
                >
                    📤 Upload New
                </button>
                <button
                    type="button"
                    onClick={() => setTab('library')}
                    style={tabStyle(tab === 'library')}
                >
                    🖼️ Select from Library
                </button>
            </div>

            {/* Upload Tab */}
            {tab === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="https://... or upload a file"
                            value={value || ''}
                            onChange={e => onChange(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                backgroundColor: '#111827',
                                color: 'white',
                                fontSize: '14px'
                            }}
                        />
                        <label style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            backgroundColor: uploading ? '#4b5563' : '#10B981',
                            color: 'white',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            opacity: uploading ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}>
                            {uploading ? '⏳ Uploading...' : '📁 Choose File'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Library Tab */}
            {tab === 'library' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {loadingLibrary ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                            ⏳ Loading images...
                        </div>
                    ) : mediaItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                            📭 No images in library. Upload one first!
                        </div>
                    ) : (
                        <>
                            {/* Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                                gap: '10px',
                                maxHeight: '250px',
                                overflowY: 'auto',
                                padding: '4px'
                            }}>
                                {mediaItems.map(item => {
                                    const isSelected = value === item.url;
                                    const isHovered = hoveredId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => onChange(item.url)}
                                            onMouseEnter={() => setHoveredId(item.id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                            style={{
                                                aspectRatio: '1/1',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: isSelected
                                                    ? '3px solid #8B5CF6'
                                                    : isHovered
                                                        ? '2px solid #6366F1'
                                                        : '2px solid transparent',
                                                boxShadow: isSelected
                                                    ? '0 0 0 3px rgba(139, 92, 246, 0.3)'
                                                    : 'none',
                                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                                transition: 'all 0.15s ease',
                                                position: 'relative'
                                            }}
                                        >
                                            <img
                                                src={item.url}
                                                alt={item.filename}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            {isSelected && (
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundColor: 'rgba(139, 92, 246, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '20px'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                    paddingTop: '8px'
                                }}>
                                    <button
                                        type="button"
                                        disabled={libraryPage === 1}
                                        onClick={() => setLibraryPage(p => p - 1)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            backgroundColor: libraryPage === 1 ? '#374151' : '#4b5563',
                                            color: libraryPage === 1 ? '#6b7280' : 'white',
                                            cursor: libraryPage === 1 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        ← Prev
                                    </button>
                                    <span>Page {libraryPage}</span>
                                    <button
                                        type="button"
                                        disabled={libraryPage === totalPages || totalPages === -1}
                                        onClick={() => setLibraryPage(p => p + 1)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            backgroundColor: libraryPage === totalPages ? '#374151' : '#4b5563',
                                            color: libraryPage === totalPages ? '#6b7280' : 'white',
                                            cursor: libraryPage === totalPages ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Preview */}
            {value && (
                <div style={{
                    marginTop: '12px',
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #374151',
                    backgroundColor: '#111827'
                }}>
                    <img
                        src={value}
                        alt="Preview"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                        title="Remove image"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
