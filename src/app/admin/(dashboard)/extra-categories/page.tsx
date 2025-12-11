import { prisma } from '@/lib/prisma';
import ExtraCategoryForm from '@/components/admin/extra-category-form';
import ExtraCategoryList from '@/components/admin/extra-category-list';
import ResponsiveGrid from '@/components/admin/responsive-grid';

export default async function ExtraCategoriesPage() {
    const categories = await prisma.extraCategory.findMany({
        include: { translations: true },
        orderBy: { id: 'asc' }
    });

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    marginBottom: '0.5rem'
                }}>
                    Extra Categories
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '1rem' }}>
                    Manage categories for product extras (toppings, sides, etc.)
                </p>
            </div>
            <ResponsiveGrid columns="1-1">
                <ExtraCategoryForm />
                <ExtraCategoryList categories={categories} />
            </ResponsiveGrid>
        </div>
    );
}
