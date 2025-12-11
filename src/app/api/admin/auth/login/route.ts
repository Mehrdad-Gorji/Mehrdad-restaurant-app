import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // Find admin user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.password) {
            return NextResponse.json({ error: 'Account not properly configured' }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                adminRole: user.adminRole
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                adminRole: user.adminRole
            }
        });

        // Set secure cookie
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
