'use client';

import { useRouter } from 'next/navigation';

export default function ExtraList({ initialExtras, onEdit }: { initialExtras: any[], onEdit: (extra: any) => void }) {
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this extra?')) return;
        await fetch(`/api/extras?id=${id}`, { method: 'DELETE' });
        router.refresh();
    };

    // Group extras by category
    const grouped: { [key: string]: any[] } = {};
    const uncategorized: any[] = [];

    initialExtras.forEach((extra: any) => {
        if (extra.category) {
            const categoryName = extra.category.translations?.find((t: any) => t.language === 'en')?.name || 'Other';
            if (!grouped[categoryName]) {
                grouped[categoryName] = [];
            }
            grouped[categoryName].push(extra);
        } else {
            uncategorized.push(extra);
        }
    });

    const allGroups = [
        ...Object.entries(grouped).map(([name, extras]) => ({ name, extras })),
        ...(uncategorized.length > 0 ? [{ name: 'Uncategorized', extras: uncategorized }] : [])
    ];

    if (allGroups.length === 0) {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧀</div>
                No extras found. Add your first extra!
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {allGroups.map(({ name, extras }) => (
                <div
                    key={name}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        overflow: 'hidden'
                    }}
                >
                    {/* Category Header */}
                    <div style={{
                        padding: '0.85rem 1.25rem',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#fff'
                    }}>
                        {name}
                        <span style={{
                            marginLeft: '0.75rem',
                            padding: '0.2rem 0.5rem',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                        }}>
                            {extras.length}
                        </span>
                    </div>

                    {/* Extras List */}
                    <div style={{ padding: '0.5rem' }}>
                        {extras.map((extra: any, idx: number) => {
                            const enName = extra.translations.find((t: any) => t.language === 'en')?.name;
                            return (
                                <div
                                    key={extra.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.85rem 1rem',
                                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    {/* Image */}
                                    <div style={{ flexShrink: 0 }}>
                                        {extra.image ? (
                                            <img
                                                src={extra.image}
                                                alt="extra"
                                                style={{
                                                    width: '42px',
                                                    height: '42px',
                                                    objectFit: 'cover',
                                                    borderRadius: '10px',
                                                    border: '2px solid rgba(255,255,255,0.1)'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '42px',
                                                height: '42px',
                                                background: 'rgba(139, 92, 246, 0.2)',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <span>🧀</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div style={{ flex: 1, fontWeight: '600', color: '#fff' }}>
                                        {enName || '-'}
                                    </div>

                                    {/* Price */}
                                    <div style={{
                                        fontWeight: '700',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        minWidth: '80px'
                                    }}>
                                        {Number(extra.price).toFixed(0)} SEK
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => onEdit(extra)}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                background: 'rgba(99, 102, 241, 0.15)',
                                                color: '#a5b4fc',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(extra.id)}
                                            style={{
                                                padding: '0.4rem 0.6rem',
                                                background: 'rgba(239, 68, 68, 0.15)',
                                                color: '#f87171',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
