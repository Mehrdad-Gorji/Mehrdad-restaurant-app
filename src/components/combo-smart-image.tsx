import { useState, useEffect } from 'react';

interface Props {
    image?: string | null;
    items?: any[];
}

function SafeImage({ src, alt, style, className, fallback }: any) {
    const [error, setError] = useState(false);

    useEffect(() => { setError(false); }, [src]);

    if (error) return fallback || null;
    return <img src={src} alt={alt} style={style} className={className} onError={() => setError(true)} />;
}

export default function ComboSmartImage({ image, items = [] }: Props) {
    const [imageError, setImageError] = useState(false);

    // Reset error state if image prop changes
    useEffect(() => {
        setImageError(false);
    }, [image]);

    // Helper to get correct URL
    const getImageUrl = (img: string | undefined | null) => {
        if (!img) return null;
        if (img.startsWith('http') || img.startsWith('/')) return img;
        return `/api/uploads/${img}`;
    };

    // Gather images from products
    const productImages = items
        .filter((it: any) => it.image)
        .map((it: any) => getImageUrl(it.image))
        .filter((url: string | null): url is string => !!url); // Type guard

    // Fallback UI
    const defaultFallback = <span style={{ fontSize: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>🎁</span>;

    // 1. If explicit combo image exists AND it hasn't failed loading, use it.
    if (image && !imageError) {
        const mainUrl = getImageUrl(image);
        if (mainUrl) {
            return (
                <img
                    src={mainUrl}
                    alt="Combo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setImageError(true)}
                />
            );
        }
    }

    // 2. Logic based on count of product images
    if (productImages.length === 0) {
        return defaultFallback;
    }

    if (productImages.length === 1) {
        // Use SafeImage for the single product fallback
        return (
            <SafeImage
                src={productImages[0]}
                alt="Product"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                fallback={defaultFallback}
            />
        );
    }

    if (productImages.length === 2) {
        return (
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                <SafeImage src={productImages[0]} style={{ width: '50%', height: '100%', objectFit: 'cover' }} fallback={<div style={{ width: '50%', height: '100%', background: '#eee' }}></div>} />
                <SafeImage src={productImages[1]} style={{ width: '50%', height: '100%', objectFit: 'cover' }} fallback={<div style={{ width: '50%', height: '100%', background: '#eee' }}></div>} />
            </div>
        );
    }

    // 3 or more (Grid) - Up to 4 images
    const displayImages = productImages.slice(0, 4);
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            width: '100%',
            height: '100%'
        }}>
            {displayImages.map((img: string, i: number) => (
                <SafeImage
                    key={i}
                    src={img}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                    fallback={<div style={{ width: '100%', height: '100%', background: '#eee' }}></div>}
                />
            ))}
        </div>
    );
}
