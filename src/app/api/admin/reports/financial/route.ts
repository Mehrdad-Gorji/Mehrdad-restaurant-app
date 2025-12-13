import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { calculateOrderVAT, DEFAULT_VAT_SETTINGS } from '@/lib/vat';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const admin = await getAdminSession();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
        return NextResponse.json({ error: 'Missing date range' }, { status: 400 });
    }

    try {
        // Fetch Settings for VAT calculation
        const settings = await prisma.siteSettings.findFirst();
        const vatSettings = settings ? {
            vatEnabled: settings.vatEnabled,
            vatNumber: settings.vatNumber,
            vatRateStandard: settings.vatRateStandard,
            vatRateReduced: settings.vatRateReduced,
            vatPriceInclusive: settings.vatPriceInclusive,
        } : DEFAULT_VAT_SETTINGS;

        // Fetch Orders in range (completed only)
        // We consider COMPLETED orders for financial reports
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);

        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: fromDate,
                    lte: toDate
                },
                status: 'COMPLETED'
            },
            include: {
                items: true,
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate Totals and Tax breakdown
        let totalSales = 0;
        let totalOrders = orders.length;
        let totalTax = 0;
        let totalFoodTax = 0;
        let totalDeliveryTax = 0;
        let totalFoodNet = 0;
        let totalDeliveryNet = 0;

        const foodVatRate = Number(vatSettings.vatRateReduced) || 0.07;
        const deliveryVatRate = Number(vatSettings.vatRateStandard) || 0.19;

        const reportOrders = orders.map(order => {
            const orderTotal = Number(order.total);
            const deliveryFee = Number(order.deliveryFee) || 0;
            const foodGross = orderTotal - deliveryFee;

            // Calculate VAT for food (reduced rate, e.g., 7%)
            const foodNet = foodGross / (1 + foodVatRate);
            const foodVat = foodGross - foodNet;

            // Calculate VAT for delivery (standard rate, e.g., 19%)
            const deliveryNet = deliveryFee / (1 + deliveryVatRate);
            const deliveryVat = deliveryFee - deliveryNet;

            const totalOrderTax = foodVat + deliveryVat;
            const totalOrderNet = foodNet + deliveryNet;

            // Accumulate
            totalSales += orderTotal;
            totalTax += totalOrderTax;
            totalFoodTax += foodVat;
            totalDeliveryTax += deliveryVat;
            totalFoodNet += foodNet;
            totalDeliveryNet += deliveryNet;

            return {
                id: order.id,
                date: order.createdAt,
                customer: order.user?.name || 'Guest',
                total: orderTotal,
                tax: Number(totalOrderTax.toFixed(2)),
                net: Number(totalOrderNet.toFixed(2)),
                foodTax: Number(foodVat.toFixed(2)),
                deliveryTax: Number(deliveryVat.toFixed(2)),
                foodNet: Number(foodNet.toFixed(2)),
                deliveryNet: Number(deliveryNet.toFixed(2)),
                deliveryFee: deliveryFee
            };
        });

        return NextResponse.json({
            summary: {
                totalOrders,
                totalSales: Number(totalSales.toFixed(2)),
                totalTax: Number(totalTax.toFixed(2)),
                netSales: Number((totalSales - totalTax).toFixed(2)),
                // VAT breakdown by rate
                foodTax: Number(totalFoodTax.toFixed(2)),
                deliveryTax: Number(totalDeliveryTax.toFixed(2)),
                foodNet: Number(totalFoodNet.toFixed(2)),
                deliveryNet: Number(totalDeliveryNet.toFixed(2)),
                foodVatRate: (foodVatRate * 100).toFixed(0),
                deliveryVatRate: (deliveryVatRate * 100).toFixed(0),
                period: { start: startDate, end: endDate }
            },
            orders: reportOrders
        });

    } catch (error) {
        console.error('Financial Report Error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
