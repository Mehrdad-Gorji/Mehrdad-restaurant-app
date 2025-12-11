
import { prisma } from '@/lib/prisma';
import ComboForm from '@/components/admin/combo-form';
import { serializePrisma } from '@/lib/serialize';

export default async function NewComboPage() {
    const products = await prisma.product.findMany({
        orderBy: { slug: 'asc' },
        include: {
            translations: true,
            sizes: { include: { translations: true } },
            extras: { include: { extra: { include: { translations: true } } } }
        }
    });

    const safeProducts = serializePrisma(products);

    return (
        <div>
            <ComboForm products={safeProducts} />
        </div>
    );
}
