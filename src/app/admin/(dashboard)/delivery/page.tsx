import { prisma } from '@/lib/prisma';
import DeliveryZoneManager from '@/components/admin/delivery-zone-list';
import { serializePrisma } from '@/lib/serialize';

export default async function DeliveryZonesPage() {
    const zones = await prisma.deliveryZone.findMany({
        orderBy: { zipStart: 'asc' }
    });

    const safeZones = serializePrisma(zones);

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
                    🚚 Delivery Zones
                </h1>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    Manage delivery prices based on postal code areas
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    minWidth: '150px'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{zones.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Zones</div>
                </div>
            </div>

            {/* Zone Manager */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '1.5rem'
            }}>
                <DeliveryZoneManager initialZones={safeZones} />
            </div>
        </div>
    );
}
