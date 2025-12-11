'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
    uniqueId: string; // generated based on id + size + extras
    productId: string;
    name: string;
    price: number;
    quantity: number;
    sizeName?: string;
    extras?: { id: string; name: string; price: number }[];
    image?: string;
    isCombo?: boolean;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'uniqueId'>) => void;
    removeFromCart: (uniqueId: string) => void;
    updateQuantity: (uniqueId: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (item: Omit<CartItem, 'uniqueId'>) => {
        const uniqueId = `${item.productId}-${item.sizeName || 'std'}-${(item.extras || []).map(e => e.id).sort().join('-')}`;

        setItems(prev => {
            const existing = prev.find(i => i.uniqueId === uniqueId);
            if (existing) {
                return prev.map(i => i.uniqueId === uniqueId ? { ...i, quantity: i.quantity + item.quantity } : i);
            }
            return [...prev, { ...item, uniqueId }];
        });
    };

    const removeFromCart = (uniqueId: string) => {
        setItems(prev => prev.filter(i => i.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId: string, delta: number) => {
        setItems(prev => prev.map(i => {
            if (i.uniqueId === uniqueId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
