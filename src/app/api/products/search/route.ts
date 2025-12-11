import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
        const minPrice = parseInt(searchParams.get('minPrice') || '0');
        const maxPrice = parseInt(searchParams.get('maxPrice') || '999999');
        const sort = searchParams.get('sort') || 'name';

        // Build where clause
        const where: any = {
            isActive: true
        };

        // Search by name
        if (query) {
            where.OR = [
                {
                    translations: {
                        some: {
                            name: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        }
                    }
                },
                {
                    translations: {
                        some: {
                            description: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        }
                    }
                }
            ];
        }

        // Filter by categories
        if (categories.length > 0) {
            where.category = {
                slug: {
                    in: categories
                }
            };
        }

        // Filter by price range
        where.price = {
            gte: minPrice,
            lte: maxPrice
        };

        // Build orderBy clause
        let orderBy: any = {};
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'name':
            default:
                orderBy = { translations: { _count: 'desc' } }; // Fallback
                break;
        }

        // Fetch products
        const products = await prisma.product.findMany({
            where,
            include: {
                category: {
                    include: {
                        translations: true
                    }
                },
                translations: true,
                sizes: {
                    include: {
                        translations: true
                    }
                },
                extras: {
                    include: {
                        extra: {
                            include: {
                                translations: true,
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
            orderBy: sort === 'name' ? undefined : orderBy
        });

        // Sort by name if needed (client-side for translations)
        if (sort === 'name') {
            products.sort((a, b) => {
                const aName = a.translations[0]?.name || '';
                const bName = b.translations[0]?.name || '';
                return aName.localeCompare(bName);
            });
        }

        return NextResponse.json({
            products,
            total: products.length,
            filters: {
                query,
                categories,
                minPrice,
                maxPrice,
                sort
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search products' },
            { status: 500 }
        );
    }
}
