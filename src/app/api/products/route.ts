import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'sv';
    const category = searchParams.get('category') || undefined;

    const products = await getProducts(lang, category);
    return NextResponse.json(products);
}
