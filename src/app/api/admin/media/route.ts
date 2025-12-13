import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming this alias exists, checking imports later
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50'); // Increased limit
        const search = searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        // Fetch directly from Supabase Storage to show all existing images
        const { data: files, error } = await supabase
            .storage
            .from('images')
            .list(null, {
                limit: limit,
                offset: offset,
                sortBy: { column: 'created_at', order: 'desc' },
                search: search || undefined
            });

        if (error) {
            throw error;
        }

        if (!files) {
            return NextResponse.json({
                data: [],
                pagination: { total: 0, pages: 0, page, limit }
            });
        }

        // Map Supabase files to our MediaItem interface
        const mediaItems = files
            .filter(f => f.name !== '.emptyFolderPlaceholder') // Filter out placeholders
            .map(file => {
                const { data: urlData } = supabase
                    .storage
                    .from('images')
                    .getPublicUrl(file.name);

                return {
                    id: file.id, // Supabase returns an ID for the file object
                    url: urlData.publicUrl,
                    filename: file.name,
                    mimeType: file.metadata?.mimetype || 'unknown',
                    size: file.metadata?.size || 0,
                    createdAt: file.created_at,
                };
            });

        // Note: Supabase list() doesn't return total count easily without a separate metadata call or unlimited list. 
        // For now, we'll assume if we got a full page, there might be more.
        // A robust solution would imply valid pagination, but for "browse" this is sufficient.

        return NextResponse.json({
            data: mediaItems,
            pagination: {
                total: mediaItems.length + (mediaItems.length === limit ? 1 : 0), // Hacky hint for "Next" button
                pages: -1, // Unknown total pages
                page,
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Upload to Supabase (Reusing logic structure from upload/route.ts)
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        // Determine correct content type
        let contentType = file.type;
        if (!contentType || contentType === 'application/octet-stream') {
            const mimeTypes: Record<string, string> = {
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'svg': 'image/svg+xml'
            };
            contentType = mimeTypes[ext] || 'image/png';
        }

        const { data, error: uploadError } = await supabase.storage
            .from('images')
            .upload(filename, buffer, {
                contentType: contentType,
                upsert: false
            });

        if (uploadError) {
            throw new Error('Supabase upload failed: ' + uploadError.message);
        }

        const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;

        // 2. Save to Database
        const media = await prisma.media.create({
            data: {
                url: publicUrl,
                filename: file.name,
                mimeType: contentType,
                size: file.size,
                altText: file.name // Default alt text
            }
        });

        return NextResponse.json(media);

    } catch (error) {
        console.error('Error uploading media:', error);
        return NextResponse.json({ error: 'Failed to upload media: ' + (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
        }

        const media = await prisma.media.findUnique({ where: { id } });
        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }

        // Extract filename from URL or store store path in DB. 
        // Based on current upload logic: url is `.../storage/v1/object/public/images/FILENAME`
        // We need just the filename in the bucket.
        // Quickest way: split by last slash.
        const storageFilename = media.url.split('/').pop();

        if (storageFilename) {
            const { error: deleteError } = await supabase.storage
                .from('images')
                .remove([storageFilename]);

            if (deleteError) {
                console.error('Supabase delete warning:', deleteError);
                // Continue to delete from DB even if file delete fails (or maybe it was already gone)
            }
        }

        await prisma.media.delete({ where: { id } });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}
