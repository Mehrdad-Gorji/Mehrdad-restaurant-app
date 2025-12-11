import CheckoutForm from '@/components/checkout-form';
import { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const locale = lang as Locale;
    const dictionary = await getDictionary(locale);

    return <CheckoutForm dictionary={dictionary} />;
}
