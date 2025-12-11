import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import mime from 'mime';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
    // In Next 15+ params is a promise, but in 14 it's not. 
    // Given the user instructions usually imply standard Next.js, often params is direct.
    // However, to be safe and compatible with latest Next.js versions which might default to async params:
    const { filename } = await params;

    try {
        const uploadDir = path.join(process.cwd(), 'uploads');
        const filepath = path.join(uploadDir, filename);

        const fileBuffer = await readFile(filepath);
        const contentType = mime.getType(filepath) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}
