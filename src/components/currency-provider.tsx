'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/hooks/use-currency';

interface CurrencyProviderProps {
    currency: string;
    symbol: string;
    children: React.ReactNode;
}

export default function CurrencyProvider({ currency, symbol, children }: CurrencyProviderProps) {
    const setCurrency = useCurrencyStore((state) => state.setCurrency);

    useEffect(() => {
        // Sync server settings to client store
        if (currency && symbol) {
            setCurrency(currency, symbol);
        }
    }, [currency, symbol, setCurrency]);

    return <>{children}</>;
}
