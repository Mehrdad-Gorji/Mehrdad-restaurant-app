import CartPageClient from "@/components/cart-page-client";
import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary";

export default async function CartPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const locale = lang as Locale;
    const dictionary = await getDictionary(locale);

    return (
        <div>
            <CartPageClient lang={locale} dictionary={dictionary} />
        </div>
    );
}
