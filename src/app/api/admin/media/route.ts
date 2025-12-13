import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        // Fetch directly from Supabase Storage
        // Pass undefined for root path to fix type error
        const { data: files, error } = await supabase
            .storage
            .from('images')
            .list(undefined, {
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

        // Map Supabase files
        const mediaItems = files
            .filter(f => f.name !== '.emptyFolderPlaceholder')
            .map(file => {
                const { data: urlData } = supabase
                    .storage
                    .from('images')
                    .getPublicUrl(file.name);

                return {
                    // Use filename as ID to make deletion easier since we aren't using a DB
                    id: file.name,
                    url: urlData.publicUrl,
                    filename: file.name,
                    mimeType: file.metadata?.mimetype || 'unknown',
                    size: file.metadata?.size || 0,
                    createdAt: file.created_at,
                };
            });

        return NextResponse.json({
            data: mediaItems,
            pagination: {
                total: mediaItems.length + (mediaItems.length === limit ? 1 : 0),
                pages: -1,
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

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        // Sanitize filename to be ASCII
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}_${sanitizedName}`;

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

        // Return structure matching GET
        return NextResponse.json({
            id: filename,
            url: urlData.publicUrl,
            filename: filename,
            mimeType: contentType,
            size: file.size,
            createdAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error uploading media:', error);
        return NextResponse.json({ error: 'Failed to upload media: ' + (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('id'); // We are using filename as ID now

        if (!filename) {
            return NextResponse.json({ error: 'Media Filename required' }, { status: 400 });
        }

        const { error: deleteError } = await supabase.storage
            .from('images')
            .remove([filename]);

        if (deleteError) {
            console.error('Supabase delete error:', deleteError);
            return NextResponse.json({ error: 'Failed to delete file from storage' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}
