import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';

/**
 * POST /api/auth/complete-registration
 *
 * Called from the /join page after the user sets their password.
 * Expects: { token: string, password: string }
 * The token is the same JWT from the invitation link.
 */
export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Verify the JWT token
        let decoded: { userId: number; email: string; purpose: string };
        try {
            decoded = verify(token, process.env.JWT_SECRET!) as typeof decoded;
        } catch (err) {
            return NextResponse.json(
                { error: 'This invitation link has expired or is invalid. Please ask your manager for a new one.' },
                { status: 400 }
            );
        }

        // Verify purpose
        if (decoded.purpose !== 'team-invite') {
            return NextResponse.json(
                { error: 'Invalid token type' },
                { status: 400 }
            );
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { UserID: decoded.userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User account not found' },
                { status: 404 }
            );
        }

        // Hash the new password and update the user
        const hashedPassword = await hash(password, 10);

        await prisma.user.update({
            where: { UserID: decoded.userId },
            data: { PasswordHash: hashedPassword },
        });

        return NextResponse.json({
            message: 'Account set up successfully! You can now log in.',
        });
    } catch (error) {
        console.error('Complete registration error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
