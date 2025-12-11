import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductListManager from '@/components/admin/product-list-manager';

export default async function AdminProductsPage() {
    // Fetch products
    const products = await prisma.product.findMany({
        include: {
            category: { include: { translations: true } },
            translations: true
        },
        orderBy: [
            { category: { slug: 'asc' } },
            { slug: 'asc' }
        ]
    });

    const serializedProducts = products.map((product) => ({
        ...product,
        price: product.price.toString(),
    }));

    // Fetch categories for the filter
    const categories = await prisma.category.findMany({
        include: { translations: true },
        orderBy: { slug: 'asc' }
    });

    return (
        <div style={{ color: '#fff' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        margin: '0',
                        background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🍕 Products
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                        Manage your menu items
                    </p>
                </div>
                <Link href="/admin/products/new" style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}>
                    + Add Product
                </Link>
            </div>

            {/* Client Component for Interactive List */}
            <ProductListManager
                initialProducts={serializedProducts}
                categories={categories}
            />
        </div>
    );
}
