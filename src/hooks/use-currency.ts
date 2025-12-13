'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyState {
    currency: string;
    symbol: string;
    setCurrency: (currency: string, symbol: string) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set) => ({
            currency: 'SEK',
            symbol: 'kr',
            setCurrency: (currency, symbol) => set({ currency, symbol }),
        }),
        {
            name: 'currency-storage',
        }
    )
);

export function useCurrency() {
    const { currency, symbol } = useCurrencyStore();

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return `${Number(numPrice).toFixed(2)} ${symbol}`;
    };

    return {
        currency,
        symbol,
        formatPrice
    };
}
