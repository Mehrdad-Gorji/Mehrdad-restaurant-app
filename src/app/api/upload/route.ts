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

        const buffer = Buffer.from(await file.arrayBuffer());

        console.log("File Info:", { name: file.name, type: file.type, size: file.size });

        // Force ASCII filename and PNG extension to debug encoding error
        // ERROR was: character at index 18 has value 1575
        const filename = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;

        console.log("Generated Filename:", filename);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filename, buffer, {
                contentType: 'image/png', // Force simple content type
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
