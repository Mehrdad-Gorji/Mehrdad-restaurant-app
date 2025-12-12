import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    console.log("🚀 Supabase Upload Route Hit! [DEBUG v2]");
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log("Env Check:", {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
            urlPrefix: supabaseUrl?.substring(0, 8)
        });

        // Check for non-ASCII characters (like Persian numbers) in env vars
        const isAscii = (str: string) => /^[\x00-\x7F]*$/.test(str);

        if (supabaseUrl && !isAscii(supabaseUrl)) {
            console.error("❌ CRTICAL ERROR: `NEXT_PUBLIC_SUPABASE_URL` contains non-English characters (e.g. Persian numbers)!");
            return NextResponse.json({ error: 'Env var config error: URL has non-English chars' }, { status: 500 });
        }
        if (supabaseKey && !isAscii(supabaseKey)) {
            console.error("❌ CRTICAL ERROR: `SUPABASE_SERVICE_ROLE_KEY` contains non-English characters (e.g. Persian numbers)!");
            // Attempt to sanitize: replace Persian numbers with English
            // But for now just fail to let user know
            return NextResponse.json({ error: 'Env var config error: KEY has non-English chars. Check Vercel settings.' }, { status: 500 });
        }

        if (!supabaseUrl || !supabaseKey) {
            console.error("❌ Missing Supabase Configuration");
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Check file size (limit to 5MB for images)
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const fileBuffer = await file.arrayBuffer();

        if (fileBuffer.byteLength > MAX_SIZE) {
            console.error('❌ File too large:', fileBuffer.byteLength, 'bytes');
            return NextResponse.json({
                error: `File too large (${(fileBuffer.byteLength / 1024 / 1024).toFixed(2)}MB). Maximum is 5MB.`
            }, { status: 400 });
        }

        const buffer = Buffer.from(fileBuffer);

        // Generate a safe, random filename (ASCII only) to avoid encoding issues
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        // Determine correct content type
        let contentType = file.type;
        if (!contentType || contentType === 'application/octet-stream') {
            // Fallback based on extension
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

        console.log('📤 Uploading file:', { filename, contentType, size: buffer.length });

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filename, buffer, {
                contentType: contentType,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(filename);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
