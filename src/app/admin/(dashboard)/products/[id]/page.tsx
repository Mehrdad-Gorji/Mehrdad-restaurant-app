import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/product-form';
import { notFound } from 'next/navigation';
import { serializePrisma } from '@/lib/serialize';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            translations: true,
            sizes: { include: { translations: true } },
            extras: { include: { extra: true } } // we need extraId
        }
    });

    if (!product) notFound();

    const categories = await prisma.category.findMany();
    const extras = await prisma.extra.findMany({
        include: { translations: true }
    });

    const safeProduct = serializePrisma(product);
    const safeExtras = serializePrisma(extras);

    return (
        <div>
            <ProductForm
                categories={categories}
                extrasArr={safeExtras}
                initialData={safeProduct}
                isEdit={true}
            />
        </div>
    );
}
