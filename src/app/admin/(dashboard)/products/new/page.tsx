import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/product-form';
import { serializePrisma } from '@/lib/serialize';

export default async function NewProductPage() {
    const categories = await prisma.category.findMany();
    const extras = await prisma.extra.findMany({
        include: { translations: true }
    });

    const safeExtras = serializePrisma(extras);

    const settings = await prisma.siteSettings.findFirst();
    const predefinedSizes = settings?.predefinedSizes
        ? JSON.parse(settings.predefinedSizes as string)
        : ['Small', 'Medium', 'Large', 'Extra Large'];

    return (
        <div>
            <ProductForm categories={categories} extrasArr={safeExtras} predefinedSizes={predefinedSizes} />
        </div>
    );
}
