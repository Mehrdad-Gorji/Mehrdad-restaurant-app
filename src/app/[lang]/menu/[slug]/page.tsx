import { getProduct, getCombo } from '@/lib/data';

import ProductDetailClient from '@/components/product-detail';
import ComboDetailClient from '@/components/combo-detail';
import { Locale } from '@/i18n-config';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
    const { lang, slug } = await params;
    const locale = lang as Locale;
    const decodedSlug = decodeURIComponent(slug);

    // Try finding product first
    const product = await getProduct(decodedSlug, locale);

    if (product) {
        return (
            <div>
                <ProductDetailClient product={product} lang={locale} />
            </div>
        );
    }

    // If no product, try finding combo
    const combo = await getCombo(decodedSlug, locale);

    if (combo) {
        return (
            <div>
                <ComboDetailClient combo={combo} lang={locale} />
            </div>
        );
    }

    // If neither, 404
    notFound();
}
