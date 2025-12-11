import { prisma } from '@/lib/prisma';
import SizeTemplates from '@/components/admin/size-templates';

export default async function SizeTemplatesPage() {
    const settings = await prisma.siteSettings.findFirst();
    const predefinedSizes = settings?.predefinedSizes
        ? JSON.parse(settings.predefinedSizes)
        : ['Small', 'Medium', 'Large', 'Extra Large'];

    return <SizeTemplates initialSizes={predefinedSizes} />;
}
