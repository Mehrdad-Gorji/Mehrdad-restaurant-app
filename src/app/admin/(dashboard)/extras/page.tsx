import { prisma } from '@/lib/prisma';
import ExtrasManager from '@/components/admin/extras-manager';
import { serializePrisma } from '@/lib/serialize';
import EntityImportExport from '@/components/admin/entity-import-export';

export default async function ExtrasPage() {
    const extras = await prisma.extra.findMany({
        include: {
            translations: true,
            category: {
                include: { translations: true }
            }
        },
        orderBy: { price: 'asc' }
    });

    const safeExtras = serializePrisma(extras);

    const categories = await prisma.extraCategory.findMany({
        include: { translations: true }
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
                        🧀 Extras
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                        Manage add-ons and toppings
                    </p>
                </div>
                <EntityImportExport
                    entityName="extras"
                    exportUrl="/api/admin/extras/export"
                    importUrl="/api/admin/extras/import"
                    templateUrl="/api/admin/extras/template"
                />
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{extras.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Extras</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{categories.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Categories</div>
                </div>
            </div>

            {/* Extras Manager */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '1.5rem'
            }}>
                <ExtrasManager initialExtras={safeExtras} categories={categories} />
            </div>
        </div>
    );
}
