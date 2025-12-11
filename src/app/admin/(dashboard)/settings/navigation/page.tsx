import fs from 'fs';
import path from 'path';
import NavigationSettingsClient from '@/components/admin/settings/navigation-settings-client';

export default async function NavigationSettingsPage() {
    // Dynamically scan for pages
    const pagesDir = path.join(process.cwd(), 'src/app/[lang]');
    let availablePages = [
        { path: '/', description: 'Home Page' }
    ];

    try {
        const entries = await fs.promises.readdir(pagesDir, { withFileTypes: true });

        const dynamicPages = entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => {
                const name = dirent.name;
                // Basic check if it's a page and not a special folder
                if (name.startsWith('(') || name.startsWith('_')) return null;

                return {
                    path: `/${name}`,
                    description: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ') + ' Page'
                };
            })
            .filter((p): p is { path: string; description: string } => p !== null)
            .sort((a, b) => a.path.localeCompare(b.path));

        availablePages = [...availablePages, ...dynamicPages];
    } catch (error) {
        console.error('Failed to scan pages directory:', error);
    }

    return <NavigationSettingsClient availablePages={availablePages} />;
}
