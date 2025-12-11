import '../globals.css'; // Reuse globals if desired, or simpler resets

export const metadata = {
    title: 'Admin Panel - Pizza Shop',
    description: 'Management Dashboard',
};

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body style={{
                margin: 0,
                padding: 0,
                fontFamily: 'sans-serif',
                // Force Light Mode Variables for Admin Panel
                // @ts-ignore
                '--primary': '#FF5722',
                '--primary-dark': '#E64A19',
                '--background': '#F9FAFB',
                '--surface': '#FFFFFF',
                '--text-main': '#1F2937',
                '--text-muted': '#6B7280',
                '--border': '#E5E7EB',
                backgroundColor: 'var(--background)',
                color: 'var(--text-main)',
            }} suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
