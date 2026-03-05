import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

/**
 * GET /api/team/invite/verify?token=<JWT>
 *
 * Verifies an invitation token and returns the invited user's name and email.
 * The token is a JWT containing { userId, email, purpose: 'team-invite' }.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Invitation token is required' },
                { status: 400 }
            );
        }

        // Decode the JWT
        let decoded: { userId: number; email: string; purpose: string };
        try {
            decoded = verify(token, process.env.JWT_SECRET!) as typeof decoded;
        } catch (err) {
            return NextResponse.json(
                { error: 'This invitation link has expired or is invalid. Please ask your manager for a new one.' },
                { status: 400 }
            );
        }

        // Verify the purpose
        if (decoded.purpose !== 'team-invite') {
            return NextResponse.json(
                { error: 'Invalid token type' },
                { status: 400 }
            );
        }

        // Find the user in the database
        const user = await prisma.user.findUnique({
            where: { UserID: decoded.userId },
            select: { UserName: true, Email: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User account not found. Please contact your manager.' },
                { status: 404 }
            );
        }

        // Return user data for the join form
        return NextResponse.json({
            name: user.UserName,
            email: user.Email,
        });
    } catch (error) {
        console.error('Invite verify error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
