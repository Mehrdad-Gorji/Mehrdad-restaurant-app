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
            // Use the new media API instead of the old upload to ensure it goes to library too
            const res = await fetch('/api/admin/media', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await res.json();
            // Data returns the whole media object, we need url
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
            const res = await fetch(`/api/admin/media?page=${page}&limit=12`);
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

    return (
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-gray-50">
            {/* Tabs */}
            <div className="flex gap-2 border-b pb-2">
                <button
                    type="button"
                    onClick={() => setTab('upload')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${tab === 'upload' ? 'bg-white shadow text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Upload New
                </button>
                <button
                    type="button"
                    onClick={() => setTab('library')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${tab === 'library' ? 'bg-white shadow text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Select from Library
                </button>
            </div>

            {/* Upload Tab */}
            {tab === 'upload' && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="https://... or upload"
                            value={value || ''}
                            onChange={e => onChange(e.target.value)}
                        />
                        <label className={`btn btn-secondary cursor-pointer whitespace-nowrap ${uploading ? 'opacity-50' : ''}`}>
                            {uploading ? 'Uploading...' : 'Choose File'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Library Tab */}
            {tab === 'library' && (
                <div className="flex flex-col gap-3">
                    {loadingLibrary ? (
                        <div className="text-center py-4 text-sm text-gray-400">Loading images...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                                {mediaItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => onChange(item.url)}
                                        className={`cursor-pointer border-2 rounded-md overflow-hidden aspect-square relative hover:opacity-80 transition-all ${value === item.url ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-transparent'}`}
                                    >
                                        <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex justify-between text-xs text-gray-500 pt-2">
                                    <button
                                        type="button"
                                        disabled={libraryPage === 1}
                                        onClick={() => setLibraryPage(p => p - 1)}
                                        className="hover:text-primary disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span>{libraryPage} / {totalPages}</span>
                                    <button
                                        type="button"
                                        disabled={libraryPage === totalPages}
                                        onClick={() => setLibraryPage(p => p + 1)}
                                        className="hover:text-primary disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Preview */}
            {value && (
                <div className="mt-2 relative w-24 h-24 border rounded-lg overflow-hidden bg-white shadow-sm group">
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
