import { prisma } from './prisma';

export async function getCategories(lang: string) {
    const categories = await prisma.category.findMany({
        include: {
            translations: {
                where: { language: lang },
            },
        },
    });

    return categories.map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        image: cat.image,
        name: cat.translations[0]?.name || cat.slug,
    }));
}

export async function getProducts(lang: string, categorySlug?: string) {
    const where = categorySlug ? { category: { slug: categorySlug } } : {};

    const products = await prisma.product.findMany({
        where,
        include: {
            category: {
                include: {
                    translations: { where: { language: lang } },
                },
            },
            translations: {
                where: { language: lang },
            },
            sizes: {
                include: {
                    translations: { where: { language: lang } },
                },
            },
            extras: {
                include: {
                    extra: {
                        include: {
                            translations: { where: { language: lang } },
                            category: {
                                include: {
                                    translations: true
                                }
                            }
                        }
                    }
                }
            }
        },
    });

    return products.map((p) => ({
        id: p.id,
        slug: p.slug,
        price: Number(p.price),
        image: p.image,
        averageRating: p.averageRating,
        reviewCount: p.reviewCount,
        name: p.translations[0]?.name || p.slug,
        description: p.translations[0]?.description,
        category: p.category.translations[0]?.name || p.category.slug,
        sizes: p.sizes.map((s) => ({
            id: s.id,
            name: s.translations[0]?.name || 'Standard',
            priceModifier: Number(s.priceModifier),
        })),
        extras: p.extras.map((pe) => ({
            id: pe.extra.id,
            name: pe.extra.translations[0]?.name || 'Extra',
            price: Number(pe.extra.price),
            category: pe.extra.category
        })),
        // Dietary Flags
        isSpicy: p.isSpicy,
        isVegetarian: p.isVegetarian,
        isGlutenFree: p.isGlutenFree,
        isVegan: p.isVegan
    }));
}

export async function getProduct(slug: string, lang: string) {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            translations: { where: { language: lang } },
            sizes: {
                include: {
                    translations: { where: { language: lang } },
                },
            },
            extras: {
                include: {
                    extra: {
                        include: {
                            translations: { where: { language: lang } },
                            category: {
                                include: {
                                    translations: true
                                }
                            }
                        }
                    }
                }
            }
        },
    });

    if (!product) return null;
    return {
        id: product.id,
        slug: product.slug,
        price: Number(product.price),
        image: product.image,
        name: product.translations[0]?.name || product.slug,
        description: product.translations[0]?.description,
        sizes: product.sizes.map((s) => ({
            id: s.id,
            name: s.translations[0]?.name || 'Standard',
            priceModifier: Number(s.priceModifier),
        })),
        extras: product.extras.map((pe) => ({
            id: pe.extra.id,
            name: pe.extra.translations[0]?.name || 'Extra',
            price: Number(pe.extra.price),
            category: pe.extra.category
        })),
    };
}

export async function getCombos(lang: string) {
    const combos = await prisma.combo.findMany({
        where: { isActive: true },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            translations: { where: { language: lang } }
                        }
                    }
                }
            }
        }
    });

    return combos.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        price: Number(c.price),
        discountType: c.discountType,
        discountValue: Number(c.discountValue),
        image: c.image,
        items: c.items.map(it => ({
            quantity: it.quantity,
            productName: it.product.translations[0]?.name || it.product.slug,
            image: it.product.image
        }))
    }));
}

export async function getCombo(slug: string, lang: string) {
    const combo = await prisma.combo.findUnique({
        where: { slug },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            translations: { where: { language: lang } }
                        }
                    }
                }
            }
        }
    });

    if (!combo) return null;

    return {
        id: combo.id,
        name: combo.name,
        slug: combo.slug,
        description: combo.description,
        price: Number(combo.price),
        discountType: combo.discountType,
        discountValue: Number(combo.discountValue),
        image: combo.image,
        isActive: combo.isActive,
        items: combo.items.map(it => ({
            quantity: it.quantity,
            productName: it.product.translations[0]?.name || it.product.slug,
            image: it.product.image
        }))
    };
}
