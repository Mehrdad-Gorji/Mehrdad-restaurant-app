'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LayoutMode = 'standard' | 'fullwidth';

type LayoutContextType = {
    layoutMode: LayoutMode;
    toggleLayoutMode: () => void;
    isFullWidth: boolean;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('standard');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load preference from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('layoutMode') as LayoutMode | null;
        if (saved && (saved === 'standard' || saved === 'fullwidth')) {
            setLayoutMode(saved);
        }
        setIsLoaded(true);
    }, []);

    // Save preference to localStorage when it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('layoutMode', layoutMode);
            // Apply class to html element for global CSS targeting
            if (layoutMode === 'fullwidth') {
                document.documentElement.classList.add('layout-fullwidth');
                document.documentElement.classList.remove('layout-standard');
            } else {
                document.documentElement.classList.add('layout-standard');
                document.documentElement.classList.remove('layout-fullwidth');
            }
        }
    }, [layoutMode, isLoaded]);

    const toggleLayoutMode = () => {
        setLayoutMode(prev => prev === 'standard' ? 'fullwidth' : 'standard');
    };

    return (
        <LayoutContext.Provider value={{
            layoutMode,
            toggleLayoutMode,
            isFullWidth: layoutMode === 'fullwidth'
        }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
}
