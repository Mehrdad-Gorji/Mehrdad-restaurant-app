import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get reviews for a product
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: {
                productId,
                isApproved: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        // Rating distribution
        const distribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
        };

        return NextResponse.json({
            reviews,
            total: reviews.length,
            averageRating: Math.round(avgRating * 10) / 10,
            distribution
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// Submit a new review
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, customerName, customerEmail, rating, comment } = body;

        // Validation
        if (!productId || !customerName || !customerEmail || !rating) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Check if customer already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                customerEmail
            }
        });

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this product' },
                { status: 400 }
            );
        }

        // Create review (pending approval)
        const review = await prisma.review.create({
            data: {
                productId,
                customerName,
                customerEmail,
                rating,
                comment: comment || null,
                isApproved: false, // Needs admin approval
                isVerified: false
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Review submitted! It will appear after admin approval.',
            review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}

// Mark review as helpful
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { reviewId } = body;

        if (!reviewId) {
            return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
        }

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: {
                helpfulCount: { increment: 1 }
            }
        });

        return NextResponse.json({ success: true, helpfulCount: review.helpfulCount });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}
