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
        let foodTax = 0;
        let deliveryTax = 0;

        const reportOrders = orders.map(order => {
            const orderTotal = Number(order.total);
            const breakdown = calculateOrderVAT(orderTotal, vatSettings);

            // Accumulate
            totalSales += orderTotal;
            totalTax += breakdown.vat;

            // Heuristic breakdown (imperfect for existing DB structure which doesn't store per-item tax)
            // But sufficient for general report based on current rules
            // Food Tax part
            const foodVatRate = vatSettings.vatRateReduced; // e.g. 0.07 or 0.12
            // Delivery Tax part
            const deliveryVatRate = vatSettings.vatRateStandard; // e.g. 0.19 or 0.25

            // We need to re-calculate breakdown properly if we want split
            // Simulating split based on delivery fee (if we had it, but API returns total)
            // For now, we use the aggregate breakdown.vat which assumes "Food" rate mostly
            // If we want perfection we need to fetch deliveryFee from order

            return {
                id: order.id,
                date: order.createdAt,
                customer: order.user?.name || 'Guest',
                total: orderTotal,
                tax: breakdown.vat,
                net: breakdown.net
            };
        });

        return NextResponse.json({
            summary: {
                totalOrders,
                totalSales: Number(totalSales.toFixed(2)),
                totalTax: Number(totalTax.toFixed(2)),
                netSales: Number((totalSales - totalTax).toFixed(2)),
                period: { start: startDate, end: endDate }
            },
            orders: reportOrders
        });

    } catch (error) {
        console.error('Financial Report Error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
