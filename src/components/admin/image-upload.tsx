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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Library state
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [libraryPage, setLibraryPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchLibrary = async (page: number) => {
        setLoadingLibrary(true);
        try {
            const res = await fetch(`/api/admin/media?page=${page}&limit=30`);
            const data = await res.json();
            if (data.data) {
                setMediaItems(data.data);
                setHasMore(data.data.length >= 30);
                setLibraryPage(data.pagination.page);
            }
        } catch (error) {
            console.error('Failed to load library:', error);
        } finally {
            setLoadingLibrary(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            fetchLibrary(libraryPage);
        }
    }, [isModalOpen, libraryPage]);

    const handleSelect = (url: string) => {
        onChange(url);
        setIsModalOpen(false);
    };

    const openModal = () => {
        setLibraryPage(1);
        setIsModalOpen(true);
    };

    return (
        <>
            {/* Trigger Button / Preview */}
            <div
                onClick={openModal}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px dashed #4b5563',
                    backgroundColor: '#1f2937',
                    cursor: 'pointer',
                    minHeight: '120px',
                    transition: 'all 0.2s',
                    position: 'relative'
                }}
            >
                {value ? (
                    <>
                        <img
                            src={value}
                            alt="Selected"
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #8B5CF6'
                            }}
                        />
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Click to change
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
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
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: '32px' }}>🖼️</span>
                        <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>
                            Select from Library
                        </span>
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '20px'
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#1f2937',
                            borderRadius: '16px',
                            maxWidth: '800px',
                            width: '100%',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                            border: '1px solid #374151'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: '1px solid #374151'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: 'white'
                            }}>
                                🖼️ Select Image from Library
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#374151',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '20px'
                        }}>
                            {loadingLibrary ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px',
                                    color: '#9ca3af'
                                }}>
                                    ⏳ Loading images...
                                </div>
                            ) : mediaItems.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px',
                                    color: '#9ca3af'
                                }}>
                                    📭 No images in library.<br />
                                    <span style={{ fontSize: '14px' }}>
                                        Go to Media Library to upload images first.
                                    </span>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                    gap: '12px'
                                }}>
                                    {mediaItems.map(item => {
                                        const isSelected = value === item.url;
                                        const isHovered = hoveredId === item.id;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(item.url)}
                                                onMouseEnter={() => setHoveredId(item.id)}
                                                onMouseLeave={() => setHoveredId(null)}
                                                style={{
                                                    aspectRatio: '1/1',
                                                    borderRadius: '10px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: isSelected
                                                        ? '3px solid #8B5CF6'
                                                        : isHovered
                                                            ? '2px solid #6366F1'
                                                            : '2px solid #374151',
                                                    boxShadow: isSelected
                                                        ? '0 0 0 3px rgba(139, 92, 246, 0.3)'
                                                        : isHovered
                                                            ? '0 8px 20px rgba(0,0,0,0.3)'
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
                                                        backgroundColor: 'rgba(139, 92, 246, 0.4)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '28px'
                                                    }}>
                                                        ✓
                                                    </div>
                                                )}
                                                {isHovered && !isSelected && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        padding: '4px',
                                                        textAlign: 'center',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {item.filename}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer / Pagination */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px 24px',
                            borderTop: '1px solid #374151'
                        }}>
                            <button
                                type="button"
                                disabled={libraryPage === 1}
                                onClick={() => setLibraryPage(p => p - 1)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: libraryPage === 1 ? '#374151' : '#4b5563',
                                    color: libraryPage === 1 ? '#6b7280' : 'white',
                                    cursor: libraryPage === 1 ? 'not-allowed' : 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                ← Previous
                            </button>

                            <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                                Page {libraryPage}
                            </span>

                            <button
                                type="button"
                                disabled={!hasMore}
                                onClick={() => setLibraryPage(p => p + 1)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: !hasMore ? '#374151' : '#4b5563',
                                    color: !hasMore ? '#6b7280' : 'white',
                                    cursor: !hasMore ? 'not-allowed' : 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
