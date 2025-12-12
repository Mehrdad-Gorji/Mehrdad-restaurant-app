
import { prisma } from '@/lib/prisma';
import ComboForm from '@/components/admin/combo-form';
import { serializePrisma } from '@/lib/serialize';
import { notFound } from 'next/navigation';

export default async function EditComboPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch Combo with items and translations
    const combo = await prisma.combo.findUnique({
        where: { id },
        include: { items: true, translations: true }
    });

    if (!combo) notFound();

    // Fetch Products context for selection
    const products = await prisma.product.findMany({
        orderBy: { slug: 'asc' },
        include: {
            translations: true,
            sizes: { include: { translations: true } },
            extras: { include: { extra: { include: { translations: true } } } }
        }
    });

    const safeCombo = serializePrisma(combo);
    const safeProducts = serializePrisma(products);

    return (
        <div>
            <ComboForm products={safeProducts} initialData={safeCombo} isEdit={true} />
        </div>
    );
}
