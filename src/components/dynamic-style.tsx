'use client';

export default function DynamicStyle({ settings }: { settings: any }) {
    if (!settings) return null;

    // Use provided colors or fall back to defaults
    const primaryColor = settings.primaryColor || '#F25F4C';
    const secondaryColor = settings.secondaryColor || '#F5DFBB';
    const backgroundColor = settings.backgroundColor || '#FFF9F2';
    const surfaceColor = settings.surfaceColor || '#FFFFFF';
    const surfaceAltColor = settings.surfaceAltColor || '#FAEEE5';
    const borderColor = settings.borderColor || '#F0DAC9';
    const textColor = settings.textColor || '#2D3436';
    const textMuted = settings.textMuted || '#636E72';
    const borderRadius = settings.borderRadius || '20px';
    const btnRadius = settings.btnRadius || '50px';
    const glassBlur = settings.glassBlur || '16px';

    return (
        <style jsx global>{`
            :root {
                /* Dynamic variables that override globals.css fallbacks */
                --dynamic-primary: ${primaryColor};
                --dynamic-primary-dark: ${secondaryColor};
                --dynamic-primary-glow: ${primaryColor}40;
                --dynamic-secondary: ${secondaryColor};
                --dynamic-background: ${backgroundColor};
                --dynamic-surface: ${surfaceColor};
                --dynamic-surface-alt: ${surfaceAltColor};
                --dynamic-border: ${borderColor};
                --dynamic-text-main: ${textColor};
                --dynamic-text-muted: ${textMuted};
                --dynamic-radius: ${borderRadius};
                --dynamic-radius-lg: calc(${borderRadius} + 12px);
                --dynamic-btn-radius: ${btnRadius};
                --dynamic-blur-amount: ${glassBlur};
                --dynamic-gradient-primary: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
                --dynamic-glass-bg: rgba(255, 249, 242, ${settings.glassOpacity || 0.75});
                --dynamic-glass-border: rgba(255, 255, 255, 0.6);
                
                /* Also set the main variables directly for immediate effect */
                --primary: ${primaryColor};
                --primary-dark: ${secondaryColor};
                --primary-glow: ${primaryColor}40;
                --secondary: ${secondaryColor};
                --background: ${backgroundColor};
                --surface: ${surfaceColor};
                --surface-alt: ${surfaceAltColor};
                --border: ${borderColor};
                --text-main: ${textColor};
                --text-muted: ${textMuted};
                --radius: ${borderRadius};
                --radius-lg: calc(${borderRadius} + 12px);
                --btn-radius: ${btnRadius};
                --blur-amount: ${glassBlur};
                --gradient-primary: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
                --glass-bg: rgba(255, 249, 242, ${settings.glassOpacity || 0.75});
                --glass-border: rgba(255, 255, 255, 0.6);
                
                /* Shadows */
                --shadow-glow: 0 8px 30px ${primaryColor}40;
            }
            
            /* Override body */
            body {
                background-color: ${backgroundColor} !important;
                color: ${textColor} !important;
            }
            
            /* Buttons */
            .btn {
                border-radius: ${btnRadius} !important;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important;
                box-shadow: 0 10px 20px -5px ${primaryColor}40 !important;
            }
            
            /* Cards */
            .card {
                background-color: ${surfaceColor} !important;
                border-color: ${borderColor} !important;
            }
            
            .card:hover {
                border-color: ${primaryColor} !important;
            }
            
            /* Selection */
            ::selection {
                background: ${primaryColor}40;
                color: ${textColor};
            }
        `}</style>
    );
}
