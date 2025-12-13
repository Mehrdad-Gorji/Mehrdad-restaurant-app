import { prisma } from '@/lib/prisma';
import SpecialOccasionWidget from '@/components/themes/special-occasion-widget';
import Link from 'next/link';

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    // Fetch Theme Settings
    let activeTheme = 'NONE';
    let customTitle = undefined;
    let customSubtitle = undefined;
    let customButtonText = undefined;
    let customBadge = undefined;

    try {
        const themeSettings = await prisma.setting.findMany({
            where: {
                key: {
                    in: [
                        'active_theme',
                        'theme_custom_title',
                        'theme_custom_subtitle',
                        'theme_custom_button',
                        'theme_custom_badge',
                        'theme_custom_image',
                        'theme_custom_color',
                        'theme_custom_opacity',
                        'theme_custom_icon'
                    ]
                }
            }
        });

        const theme = themeSettings.find(s => s.key === 'active_theme');
        if (theme) activeTheme = theme.value;

        customTitle = themeSettings.find(s => s.key === 'theme_custom_title')?.value;
        customSubtitle = themeSettings.find(s => s.key === 'theme_custom_subtitle')?.value;
        customButtonText = themeSettings.find(s => s.key === 'theme_custom_button')?.value;
        customBadge = themeSettings.find(s => s.key === 'theme_custom_badge')?.value;

        // New Custom Theme Props
        var customImage = themeSettings.find(s => s.key === 'theme_custom_image')?.value;
        var customColor = themeSettings.find(s => s.key === 'theme_custom_color')?.value;
        var customOpacity = themeSettings.find(s => s.key === 'theme_custom_opacity')?.value;
        var customIcon = themeSettings.find(s => s.key === 'theme_custom_icon')?.value;
    } catch (e) {
        // ignore
    }

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            position: 'relative',
        }}>
            {/* Theme Widget - Visible on ALL Dashboard pages */}
            <div className="container" style={{ paddingTop: '2rem' }}>
                <Link
                    href={`/${lang}/dashboard`}
                    style={{
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}
                >
                    ← Back to Dashboard
                </Link>

                <SpecialOccasionWidget
                    theme={activeTheme}
                    lang={lang}
                    customTitle={customTitle}
                    customSubtitle={customSubtitle}
                    customButtonText={customButtonText}

                    customBadge={customBadge}
                    customImage={customImage}
                    customColor={customColor}
                    customOpacity={customOpacity ? parseInt(customOpacity) : 100}
                    customIcon={customIcon}
                />
            </div>

            {/* Page Content */}
            {children}
        </div>
    );
}
