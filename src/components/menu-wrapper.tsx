'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import CategoryNav from './category-nav';

interface MenuWrapperProps {
    categories: any[];
    combos: any[];
    dealsTitle: string;
    children: ReactNode;
}

export default function MenuWrapper({ categories, combos, dealsTitle, children }: MenuWrapperProps) {
    const [activeCategory, setActiveCategory] = useState<string>('');

    useEffect(() => {
        const sectionIds = combos.length > 0
            ? ['deals', ...categories.map(c => c.slug)]
            : categories.map(c => c.slug);

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200; // Offset for sticky header

            // Find which section is currently in view
            for (let i = sectionIds.length - 1; i >= 0; i--) {
                const section = document.getElementById(sectionIds[i]);
                if (section) {
                    const sectionTop = section.offsetTop;
                    if (scrollPosition >= sectionTop) {
                        setActiveCategory(sectionIds[i]);
                        return;
                    }
                }
            }

            // Default to first section if at top
            if (sectionIds.length > 0) {
                setActiveCategory(sectionIds[0]);
            }
        };

        // Initial check
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [categories, combos]);

    return (
        <>
            <CategoryNav
                categories={categories}
                combos={combos}
                dealsTitle={dealsTitle}
                activeCategory={activeCategory}
            />
            {children}
        </>
    );
}
