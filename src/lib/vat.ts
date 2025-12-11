// VAT (Value Added Tax) utility functions for EU tax calculations

export interface VATSettings {
    vatEnabled: boolean;
    vatNumber: string;
    vatRateStandard: number; // e.g., 0.19 for 19%
    vatRateReduced: number;  // e.g., 0.07 for 7%
    vatPriceInclusive: boolean;
}

export interface VATBreakdown {
    gross: number;   // Price with VAT (what customer pays)
    net: number;     // Price without VAT
    vat: number;     // VAT amount
    rate: number;    // VAT rate used
}

// Default VAT settings (Germany)
export const DEFAULT_VAT_SETTINGS: VATSettings = {
    vatEnabled: true,
    vatNumber: '',
    vatRateStandard: 0.19,
    vatRateReduced: 0.07,
    vatPriceInclusive: true,
};

/**
 * Calculate VAT breakdown from a price
 * For EU: prices are typically VAT-inclusive
 */
export function calculateVAT(
    price: number,
    rate: number,
    inclusive: boolean = true
): VATBreakdown {
    if (inclusive) {
        // Price includes VAT - extract VAT from gross
        const gross = price;
        const net = gross / (1 + rate);
        const vat = gross - net;
        return {
            gross: Math.round(gross * 100) / 100,
            net: Math.round(net * 100) / 100,
            vat: Math.round(vat * 100) / 100,
            rate
        };
    } else {
        // Price excludes VAT - add VAT to net
        const net = price;
        const vat = net * rate;
        const gross = net + vat;
        return {
            gross: Math.round(gross * 100) / 100,
            net: Math.round(net * 100) / 100,
            vat: Math.round(vat * 100) / 100,
            rate
        };
    }
}

/**
 * Calculate VAT for an order total
 * Uses reduced rate for food (typical in EU)
 */
export function calculateOrderVAT(
    total: number,
    settings: VATSettings
): VATBreakdown {
    if (!settings.vatEnabled) {
        return {
            gross: total,
            net: total,
            vat: 0,
            rate: 0
        };
    }

    // Use reduced rate for food orders
    return calculateVAT(total, settings.vatRateReduced, settings.vatPriceInclusive);
}

/**
 * Format VAT rate as percentage string
 */
export function formatVATRate(rate: number): string {
    return `${(rate * 100).toFixed(0)}%`;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'SEK'): string {
    return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Get country-specific VAT presets
 */
export const VAT_PRESETS = {
    DE: { name: 'Germany', standard: 0.19, reduced: 0.07 },
    SE: { name: 'Sweden', standard: 0.25, reduced: 0.12 },
    AT: { name: 'Austria', standard: 0.20, reduced: 0.10 },
    NL: { name: 'Netherlands', standard: 0.21, reduced: 0.09 },
    FR: { name: 'France', standard: 0.20, reduced: 0.055 },
    IT: { name: 'Italy', standard: 0.22, reduced: 0.10 },
    ES: { name: 'Spain', standard: 0.21, reduced: 0.10 },
};
