const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // Load environment variables from .env file

const prisma = new PrismaClient();

// Initialize Supabase (using Service Role Key for admin access if possible, or public key)
// Warning: Listing bucket files usually requires Service Role Key or proper RLS policies.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase Configuration (check .env)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncImages() {
    console.log('🔄 Starting Media Library Sync...');

    try {
        // 1. List files from Supabase 'images' bucket
        // Note: limit is 100 by default, might need pagination for many images
        const { data: files, error } = await supabase
            .storage
            .from('images')
            .list(null, { limit: 1000 });

        if (error) {
            throw new Error(`Supabase List Error: ${error.message}`);
        }

        if (!files || files.length === 0) {
            console.log('⚠️ No files found in Supabase "images" bucket.');
            return;
        }

        console.log(`📂 Found ${files.length} files in Supabase. Checking DB...`);

        let addedCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            // Skip folders or empty names
            if (!file.name || file.name === '.emptyFolderPlaceholder') continue;

            // Get Public URL
            const { data: urlData } = supabase
                .storage
                .from('images')
                .getPublicUrl(file.name);

            const publicUrl = urlData.publicUrl;

            // Check if already exists in Media table
            const existing = await prisma.media.findUnique({
                where: { url: publicUrl }
            });

            if (existing) {
                skippedCount++;
                // console.log(`   ⏭️ Skipped: ${file.name}`);
            } else {
                // Insert into DB
                await prisma.media.create({
                    data: {
                        url: publicUrl,
                        filename: file.name,
                        mimeType: file.metadata?.mimetype || 'application/octet-stream',
                        size: file.metadata?.size || 0,
                        altText: file.name
                    }
                });
                console.log(`   ✅ Added: ${file.name}`);
                addedCount++;
            }
        }

        console.log('🎉 Sync Complete!');
        console.log(`   Total Files in Bucket: ${files.length}`);
        console.log(`   Added to DB: ${addedCount}`);
        console.log(`   Skipped (Already in DB): ${skippedCount}`);

    } catch (err) {
        console.error('❌ Sync Failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

syncImages();
