'use client';

import { CSSProperties, ReactNode } from 'react';

interface ResponsiveGridProps {
    children: ReactNode;
    columns?: '1-2' | '1-1' | '2-1' | '1-1-1' | 'auto-fit' | 'auto-fill';
    gap?: string;
    style?: CSSProperties;
}

export default function ResponsiveGrid({ children, columns = '1-1', gap = '2rem', style }: ResponsiveGridProps) {
    const getGridTemplate = () => {
        switch (columns) {
            case '1-2':
                return {
                    gridTemplateColumns: '1fr 2fr',
                    '@media (max-width: 768px)': {
                        gridTemplateColumns: '1fr'
                    }
                };
            case '2-1':
                return {
                    gridTemplateColumns: '2fr 1fr',
                    '@media (max-width: 768px)': {
                        gridTemplateColumns: '1fr'
                    }
                };
            case '1-1':
                return {
                    gridTemplateColumns: '1fr 1fr',
                    '@media (max-width: 768px)': {
                        gridTemplateColumns: '1fr'
                    }
                };
            case '1-1-1':
                return {
                    gridTemplateColumns: '1fr 1fr 1fr',
                    '@media (max-width: 1024px)': {
                        gridTemplateColumns: '1fr 1fr'
                    },
                    '@media (max-width: 768px)': {
                        gridTemplateColumns: '1fr'
                    }
                };
            case 'auto-fit':
                return {
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
                };
            case 'auto-fill':
                return {
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
                };
            default:
                return {
                    gridTemplateColumns: '1fr 1fr'
                };
        }
    };

    const gridConfig = getGridTemplate();

    return (
        <>
            <div
                className="responsive-grid"
                style={{
                    display: 'grid',
                    gap,
                    ...style
                }}
            >
                {children}
            </div>
            <style jsx>{`
                .responsive-grid {
                    grid-template-columns: ${gridConfig.gridTemplateColumns};
                }

                @media (max-width: 768px) {
                    .responsive-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .responsive-grid {
                        gap: 1.5rem;
                    }
                }
            `}</style>
        </>
    );
}
