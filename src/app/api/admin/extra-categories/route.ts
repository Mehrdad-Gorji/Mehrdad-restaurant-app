import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const categories = await prisma.extraCategory.findMany({
            include: { translations: true }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nameEn, nameSv, nameDe, nameFa } = body;

        const category = await prisma.extraCategory.create({
            data: {
                translations: {
                    create: [
                        { language: 'en', name: nameEn },
                        { language: 'sv', name: nameSv || nameEn },
                        { language: 'de', name: nameDe || nameEn },
                        { language: 'fa', name: nameFa || nameEn },
                    ]
                }
            },
            include: { translations: true }
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
