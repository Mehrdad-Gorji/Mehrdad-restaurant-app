import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// Get all reviews (admin)
export async function GET(request: NextRequest) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status'); // approved, pending, all
        const productId = searchParams.get('productId');

        const where: any = {};

        if (status === 'approved') where.isApproved = true;
        else if (status === 'pending') where.isApproved = false;

        if (productId) where.productId = productId;

        const reviews = await prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reviews, total: reviews.length });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// Approve/Reject review
export async function PATCH(request: NextRequest) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { reviewId, action } = body; // action: 'approve' | 'reject'

        if (!reviewId || !action) {
            return NextResponse.json({ error: 'Missing reviewId or action' }, { status: 400 });
        }

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: {
                isApproved: action === 'approve'
            }
        });

        // Recalculate average rating for the product
        const allReviews = await prisma.review.findMany({
            where: { productId: review.productId, isApproved: true }
        });

        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

        await prisma.product.update({
            where: { id: review.productId },
            data: {
                averageRating: avgRating,
                reviewCount: allReviews.length
            }
        });

        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

// Delete review
export async function DELETE(request: NextRequest) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const reviewId = searchParams.get('id');

        if (!reviewId) {
            return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
        }

        const review = await prisma.review.delete({
            where: { id: reviewId }
        });

        // Recalculate average rating
        const allReviews = await prisma.review.findMany({
            where: { productId: review.productId, isApproved: true }
        });

        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

        await prisma.product.update({
            where: { id: review.productId },
            data: {
                averageRating: avgRating,
                reviewCount: allReviews.length
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
