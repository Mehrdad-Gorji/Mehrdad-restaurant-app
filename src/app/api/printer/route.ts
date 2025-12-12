import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to format currency
const formatPrice = (amount: any) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(Number(amount));
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const apikey = searchParams.get('apikey');

    console.log("🖨️ Printer Request:", { action, apikey });

    // 1. Authenticate
    if (apikey !== '123456') {
        return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    // 2. Handle Fetch Orders
    if (action === 'erfan_autoprinter_get_order') {
        try {
            // Fetch unprinted orders that are PAID or PREPARING
            // Adjust status filter based on your workflow (e.g. maybe also PENDING if cash payment)
            const orders = await prisma.order.findMany({
                where: {
                    isPrinted: false,
                    status: { in: ['PAID', 'PREPARING'] }, // Only print confirmed orders
                },
                include: {
                    user: true,
                    items: {
                        include: {
                            product: {
                                include: {
                                    translations: true // Get translated names
                                }
                            },
                            // If you have extras relation handling:
                            extras: {
                                include: {
                                    extra: {
                                        include: {
                                            translations: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc' // Oldest first
                },
                take: 5 // Process a few at a time
            });

            if (orders.length === 0) {
                return NextResponse.json([]); // No orders
            }

            // Format orders for printer (List of objects)
            const response = orders.map(order => {
                // Parse address if valid JSON
                let address: any = {};
                try {
                    address = order.addressJson ? JSON.parse(order.addressJson) : {};
                } catch (e) {
                    address = { street: 'Unknown Address' };
                }

                const customerName = order.user?.name || address.firstName + ' ' + address.lastName || 'Guest';
                const customerPhone = order.user?.phone || address.phone || 'No Phone';

                // Build HTML Receipt
                const itemsHtml = order.items.map(item => {
                    const productName = item.product?.translations.find(t => t.language === 'sv')?.name || item.product?.slug || 'Unknown Product';
                    const extrasHtml = item.extras.map(e => {
                        const extraName = e.name || 'Extra';
                        return `<div style="font-size: 10px; margin-left: 10px;">+ ${extraName} (${formatPrice(e.price)})</div>`;
                    }).join('');

                    return `
                        <div style="margin-bottom: 5px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
                            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                <span>${item.quantity}x ${productName} ${item.size ? `(${item.size})` : ''}</span>
                                <span>${formatPrice(Number(item.price) * item.quantity)}</span>
                            </div>
                            ${extrasHtml}
                        </div>
                    `;
                }).join('');

                const orderDate = new Date(order.createdAt).toLocaleString('sv-SE');

                const htmlContent = `
                    <div style="width: 300px; font-family: sans-serif; font-size: 12px; color: #000;">
                        <h2 style="text-align: center; margin: 0;">Pizza Shop</h2>
                        <p style="text-align: center; margin: 5px 0 10px 0;">Storgatan 1, Stockholm</p>
                        
                        <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 5px 0; margin-bottom: 10px;">
                            <p style="margin: 2px 0;"><strong>Order #${order.id.slice(0, 8)}</strong></p>
                            <p style="margin: 2px 0;">Date: ${orderDate}</p>
                            <p style="margin: 2px 0;">Type: <strong>${order.deliveryMethod}</strong></p>
                            <p style="margin: 2px 0;">Pay: <strong>${order.status}</strong></p>
                        </div>

                        <div style="margin-bottom: 15px;">
                            <p style="margin: 2px 0; font-weight: bold;">Customer:</p>
                            <p style="margin: 2px 0;">${customerName}</p>
                            <p style="margin: 2px 0;">${customerPhone}</p>
                            <p style="margin: 2px 0;">${address.street || ''}, ${address.city || ''}</p>
                            ${address.doorCode ? `<p style="margin: 2px 0;">Code: ${address.doorCode}</p>` : ''}
                        </div>

                        <div style="margin-bottom: 10px;">
                            ${itemsHtml}
                        </div>

                        <div style="border-top: 2px solid #000; padding-top: 5px; text-align: right; font-size: 14px;">
                            <p style="margin: 0;">Delivery Fee: ${formatPrice(order.deliveryFee)}</p>
                            ${Number(order.tip) > 0 ? `<p style="margin: 0;">Tip: ${formatPrice(order.tip)}</p>` : ''}
                            <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">TOTAL: ${formatPrice(order.total)}</p>
                        </div>
                        
                        <p style="text-align: center; margin-top: 20px; font-size: 10px;">Thank you for your order!</p>
                    </div>
                `;

                return {
                    id: order.id, // Printer uses this ID to call update_order
                    title: `Order #${order.id.slice(0, 8)}`,
                    content: htmlContent
                };
            });

            return NextResponse.json(response);

        } catch (error) {
            console.error("❌ Printer API Error:", error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }

    // 3. Handle Mark as Printed
    if (action === 'erfan_autoprinter_update_order') {
        const id = searchParams.get('id');
        if (id) {
            try {
                await prisma.order.update({
                    where: { id: id },
                    data: { isPrinted: true }
                });
                console.log("✅ Printer confirmed print for order:", id);
                return NextResponse.json({ success: true });
            } catch (error) {
                console.error("❌ Failed to update order printed status:", error);
                // Return success anyway to stop printer from retrying endlessly if id is wrong
                return NextResponse.json({ success: false });
            }
        }
    }

    return NextResponse.json({ message: 'Printer API Ready (PizzaShop)' });
}
