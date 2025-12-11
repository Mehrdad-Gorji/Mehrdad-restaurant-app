import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/serialize';

export async function GET() {
  const combos = await prisma.combo.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: { include: { translations: true } }, } } }
  });
  return NextResponse.json(serializePrisma(combos));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description, price, discountType, discountValue, isActive, items, image } = body;

    // Validate required fields
    if (!name || !slug || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const created = await prisma.combo.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        discountType,
        discountValue: Number(discountValue || 0),
        isActive: isActive ?? true,
        image,
        items: {
          create: (items || []).map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity ?? 1,
            sizeName: it.sizeName,
            extrasJson: it.extrasJson ? JSON.stringify(it.extrasJson) : null,
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json(serializePrisma(created));
  } catch (error: any) {
    console.error('Create Combo Error:', error);
    // Handle Unique Constraint
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
