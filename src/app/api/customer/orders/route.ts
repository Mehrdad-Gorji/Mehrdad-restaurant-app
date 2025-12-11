import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get orders for a customer by email
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const orders = await prisma.order.findMany({
            where: {
                user: {
                    email: email
                }
            },
            include: {
                items: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ orders, total: orders.length });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

// Re-order: Create a new order based on an existing one
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Get the original order
        const originalOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!originalOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Return cart items for re-ordering (client will add to cart)
        const cartItems = originalOrder.items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            extras: item.extras ? JSON.parse(item.extras) : []
        }));

        return NextResponse.json({
            success: true,
            cartItems,
            message: 'Items ready to add to cart'
        });
    } catch (error) {
        console.error('Error preparing reorder:', error);
        return NextResponse.json({ error: 'Failed to prepare reorder' }, { status: 500 });
    }
}
