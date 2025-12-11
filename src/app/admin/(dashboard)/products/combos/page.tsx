import { prisma } from '@/lib/prisma';
import ComboList from '@/components/admin/combo-list';
import { serializePrisma } from '@/lib/serialize';
import Link from 'next/link';

export default async function CombosPage() {
  const combos = await prisma.combo.findMany({
    include: { items: { include: { product: { include: { translations: true } } } } },
    orderBy: { createdAt: 'desc' }
  });

  const safeCombos = serializePrisma(combos);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '0.5rem'
          }}>Active Combos</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '1rem' }}>Create and manage product bundles.</p>
        </div>
        <Link href="/admin/products/combos/new" style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <span>+</span> Create New Combo
        </Link>
      </div>

      <ComboList combos={safeCombos} />
    </div>
  );
}
