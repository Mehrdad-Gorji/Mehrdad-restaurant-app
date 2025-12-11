'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface CategoryNavProps {
    categories: any[];
    combos: any[];
    dealsTitle: string;
    activeCategory?: string;
}

export default function CategoryNav({ categories, combos, dealsTitle, activeCategory }: CategoryNavProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [needsScroll, setNeedsScroll] = useState(false);

    // Check if content overflows
    useEffect(() => {
        const checkOverflow = () => {
            if (scrollRef.current) {
                setNeedsScroll(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
            }
        };
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [categories, combos]);

    // Scroll active category into view
    useEffect(() => {
        if (activeCategory && scrollRef.current && needsScroll) {
            const activeElement = scrollRef.current.querySelector(`[data-category="${activeCategory}"]`);
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeCategory, needsScroll]);

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!scrollRef.current) return;
        setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!scrollRef.current) return;
        const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const isActive = (slug: string) => activeCategory === slug;

    return (
        <div style={{
            position: 'sticky',
            top: '70px',
            zIndex: 90,
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '1rem 0',
            marginBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            width: '100%'
        }}>
            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    gap: '1.5rem',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    padding: '0.5rem 1rem 1rem',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    cursor: needsScroll ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none',
                    justifyContent: needsScroll ? 'flex-start' : 'center'
                }}
            >
                <style>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {/* Deals Circle */}
                {combos.length > 0 && (
                    <a
                        href="#deals"
                        data-category="deals"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            flex: '0 0 auto',
                            minWidth: '90px',
                            transition: 'transform 0.3s ease'
                        }}
                        draggable={false}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isActive('deals')
                                ? '0 0 0 3px #ff9800, 0 4px 20px rgba(255, 152, 0, 0.6)'
                                : '0 4px 15px rgba(255, 152, 0, 0.4)',
                            border: '2px solid rgba(255,255,255,0.2)',
                            transform: isActive('deals') ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.3s ease'
                        }}>
                            <span style={{ fontSize: '2rem' }}>🔥</span>
                        </div>
                        <span style={{
                            color: '#ff9800',
                            fontWeight: isActive('deals') ? '700' : '600',
                            fontSize: isActive('deals') ? '0.85rem' : '0.8rem',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease'
                        }}>{dealsTitle}</span>
                    </a>
                )}

                {/* Category Circles */}
                {categories.map((cat: any) => (
                    <a
                        key={cat.id}
                        href={`#${cat.slug}`}
                        data-category={cat.slug}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            flex: '0 0 auto',
                            minWidth: '90px',
                            transition: 'transform 0.3s ease'
                        }}
                        draggable={false}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: cat.image
                                ? `url(${cat.image}) center/cover`
                                : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: isActive(cat.slug)
                                ? '3px solid #ff9800'
                                : '2px solid rgba(255,255,255,0.15)',
                            boxShadow: isActive(cat.slug)
                                ? '0 0 0 2px #ff9800, 0 4px 20px rgba(255, 152, 0, 0.5)'
                                : '0 4px 10px rgba(0,0,0,0.3)',
                            overflow: 'hidden',
                            transform: isActive(cat.slug) ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.3s ease'
                        }}>
                            {!cat.image && (
                                <span style={{ fontSize: '1.3rem', opacity: 0.5 }}>🍕</span>
                            )}
                        </div>
                        <span style={{
                            color: isActive(cat.slug) ? '#ff9800' : 'rgba(255,255,255,0.8)',
                            fontWeight: isActive(cat.slug) ? '700' : '500',
                            fontSize: isActive(cat.slug) ? '0.85rem' : '0.8rem',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease'
                        }}>{cat.name}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}
