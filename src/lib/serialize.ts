export function serializePrisma<T>(data: T): T {
    const seen = new WeakSet();

    function recurse(value: any): any {
        if (value === null || value === undefined) return value;

        // Primitives
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;

        // Dates -> ISO strings
        if (value instanceof Date) return value.toISOString();

        // Detect Prisma Decimal / Decimal.js instances by presence of toNumber
        if (typeof value === 'object' && typeof value.toNumber === 'function') {
            try {
                return value.toNumber();
            } catch {
                return value.toString();
            }
        }

        // Arrays
        if (Array.isArray(value)) return value.map(v => recurse(v));

        // Objects
        if (typeof value === 'object') {
            if (seen.has(value)) return undefined;
            seen.add(value);
            const out: any = {};
            for (const k of Object.keys(value)) {
                out[k] = recurse(value[k]);
            }
            return out;
        }

        return value;
    }

    return recurse(data);
}
