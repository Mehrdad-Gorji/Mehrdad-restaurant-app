import { prisma } from '@/lib/prisma';
import CategoryForm from '@/components/admin/category-form';
import CategoryList from '@/components/admin/category-list';

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { slug: 'asc' },
        include: { translations: true }
    });

    return (
        <div style={{ color: '#fff' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    margin: '0',
                    background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    📁 Categories
                </h1>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    Manage product categories and translations
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{categories.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Categories</div>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* Form Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        marginTop: 0,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>➕</span> Add Category
                    </h2>
                    <CategoryForm />
                </div>

                {/* List Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        marginTop: 0,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>📋</span> All Categories
                    </h2>
                    <CategoryList initialCategories={categories} />
                </div>
            </div>
        </div>
    );
}
