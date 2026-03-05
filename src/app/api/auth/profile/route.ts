import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/auth/profile
 *
 * Updates the current user's profile (username).
 * Expects: { username: string }
 */
export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number };
        const { username } = await request.json();

        if (!username || !username.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        if (username.trim().length < 2) {
            return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
        }

        // Check if username is already taken by another user
        const existing = await prisma.user.findFirst({
            where: {
                UserName: username.trim(),
                NOT: { UserID: decoded.userId },
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'This username is already taken' }, { status: 409 });
        }

        const updatedUser = await prisma.user.update({
            where: { UserID: decoded.userId },
            data: { UserName: username.trim() },
            select: { UserID: true, UserName: true, Email: true, Role: true },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
