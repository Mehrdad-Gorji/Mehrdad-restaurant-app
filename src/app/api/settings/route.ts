import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let settings = await prisma.siteSettings.findFirst();
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    brandName: 'PizzaShop',
                    primaryColor: '#F25F4C',
                    secondaryColor: '#F5DFBB',
                    backgroundColor: '#FFF9F2',
                    heroTitle: 'Delicious Pizza Delivered',
                    heroDescription: 'Authentic Italian flavors delivered straight to your doorstep.',

                    // Design Defaults
                    textColor: '#2D3436',
                    textMuted: '#636E72',
                    surfaceColor: '#FFFFFF',
                    surfaceAltColor: '#FAEEE5',
                    borderColor: '#F0DAC9',
                    borderRadius: '20px',
                    btnRadius: '50px',
                    glassOpacity: 0.75,
                    glassBlur: '16px',

                    // Footer Defaults
                    footerBrandDesc: 'Die beste Pizzeria der Stadt serviert authentische italienische Aromen.',
                    footerAddress: 'Storgatan 1, 123 45 Stockholm, Sweden',
                    footerPhone: '+46 123 456 789',
                    footerEmail: 'info@pizzashop.com',
                    openingHours: "Mon-Sun: 11:00 - 23:00",
                    socialFacebook: 'https://facebook.com',
                    socialInstagram: 'https://instagram.com',
                    socialTwitter: 'https://twitter.com',
                    mapEmbedUrl: '',
                    scheduleEnabled: false,
                    operatingSchedule: '{}'
                }
            });
        }
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const settings = await prisma.siteSettings.findFirst();

        const data = {
            brandName: body.brandName,
            logo: body.logo,
            primaryColor: body.primaryColor,
            secondaryColor: body.secondaryColor,
            backgroundColor: body.backgroundColor,
            heroTitle: body.heroTitle,
            heroDescription: body.heroDescription,
            heroImage: body.heroImage,
            heroTitleColor: body.heroTitleColor,

            textColor: body.textColor,
            textMuted: body.textMuted,
            surfaceColor: body.surfaceColor,
            surfaceAltColor: body.surfaceAltColor,
            borderColor: body.borderColor,
            borderRadius: body.borderRadius,
            btnRadius: body.btnRadius,
            glassOpacity: typeof body.glassOpacity === 'number' ? body.glassOpacity : parseFloat(body.glassOpacity) || 0.75,
            glassBlur: body.glassBlur,

            footerBrandDesc: body.footerBrandDesc,
            footerAddress: body.footerAddress,
            footerPhone: body.footerPhone,
            footerEmail: body.footerEmail,
            openingHours: body.openingHours,
            socialFacebook: body.socialFacebook,
            socialInstagram: body.socialInstagram,
            socialTwitter: body.socialTwitter,
            mapEmbedUrl: body.mapEmbedUrl,
            headerNavLinks: body.headerNavLinks,
            scheduleEnabled: body.scheduleEnabled,
            operatingSchedule: body.operatingSchedule,


            // Custom Closed Message
            closedTitle: body.closedTitle,
            closedMessage: body.closedMessage,
            closedBtnText: body.closedBtnText,
            closedHoursText: body.closedHoursText,

            // Welcome Coupon
            welcomeCouponEnabled: body.welcomeCouponEnabled,
            welcomeCouponValue: body.welcomeCouponValue,
            welcomeCouponType: body.welcomeCouponType,
            welcomeCouponDays: body.welcomeCouponDays,

            // Loyalty Rewards
            loyaltySecondOrderEnabled: body.loyaltySecondOrderEnabled,
            loyaltySecondOrderValue: body.loyaltySecondOrderValue,
            loyaltySecondOrderType: body.loyaltySecondOrderType,
            loyaltySecondOrderDays: body.loyaltySecondOrderDays,

            loyaltyThirdOrderEnabled: body.loyaltyThirdOrderEnabled,
            loyaltyThirdOrderValue: body.loyaltyThirdOrderValue,
            loyaltyThirdOrderType: body.loyaltyThirdOrderType,
            loyaltyThirdOrderDays: body.loyaltyThirdOrderDays,

            // VAT Settings
            vatEnabled: body.vatEnabled,
            vatNumber: body.vatNumber,
            vatRateStandard: typeof body.vatRateStandard === 'number' ? body.vatRateStandard : parseFloat(body.vatRateStandard) || 0.19,
            vatRateReduced: typeof body.vatRateReduced === 'number' ? body.vatRateReduced : parseFloat(body.vatRateReduced) || 0.07,
            vatPriceInclusive: body.vatPriceInclusive,
            predefinedSizes: body.predefinedSizes,

            // Payment Gateway Settings
            swedbankPayEnabled: body.swedbankPayEnabled,
            swedbankPayMode: body.swedbankPayMode,
            swedbankPayPayeeId: body.swedbankPayPayeeId,
            swedbankPayAccessToken: body.swedbankPayAccessToken,
            swedbankPayPayeeName: body.swedbankPayPayeeName,
            swishEnabled: body.swishEnabled,
            cardPaymentEnabled: body.cardPaymentEnabled,
        };

        if (settings) {
            const updated = await prisma.siteSettings.update({
                where: { id: settings.id },
                data: data
            });

            revalidatePath('/', 'layout');
            return NextResponse.json(updated);
        } else {
            const created = await prisma.siteSettings.create({
                data: data
            });

            revalidatePath('/', 'layout');
            return NextResponse.json(created);
        }
    } catch (error) {
        console.error('Settings Update Error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
