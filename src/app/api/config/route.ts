import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// GET specific key or all keys
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    try {
        if (key) {
            const setting = await prisma.setting.findUnique({
                where: { key }
            });
            return NextResponse.json(setting || { key, value: null });
        }

        const settings = await prisma.setting.findMany();
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// POST to update or create a key-value pair
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });

        // Invalidate cache for all pages to reflect setting changes immediately
        revalidatePath('/', 'layout');

        return NextResponse.json(setting);
    } catch (error) {
        console.error("Config update error:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
