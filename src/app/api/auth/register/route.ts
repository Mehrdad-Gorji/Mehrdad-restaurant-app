import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name, phone, street, city, zipCode } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Create user
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name: name || '',
                phone: phone || '',
                role: 'USER'
            }
        });

        // Create wallet for user
        await prisma.wallet.create({
            data: {
                userId: user.id,
                balance: 0
            }
        });

        // Create address if provided
        if (street && city && zipCode) {
            await prisma.address.create({
                data: {
                    userId: user.id,
                    street,
                    city,
                    zipCode
                }
            });
        }

        // Automatic Welcome Coupon
        const settings = await prisma.siteSettings.findFirst();
        if (settings?.welcomeCouponEnabled) {
            const couponCode = `WELCOME-${user.id.slice(0, 8).toUpperCase()}`;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + (settings.welcomeCouponDays || 30));

            await prisma.coupon.create({
                data: {
                    code: couponCode,
                    type: settings.welcomeCouponType || 'PERCENTAGE',
                    value: settings.welcomeCouponValue || 10,
                    isActive: true,
                    startDate: new Date(),
                    endDate: expiryDate,
                    maxUses: 1,
                    maxUsesPerUser: 1,
                    applyTo: 'total',
                    allowedUsers: {
                        connect: { id: user.id }
                    }
                }
            });
        }

        // Generate token and set cookie
        const token = generateToken(user.id);
        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500 }
        );
    }
}
