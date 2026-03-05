import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { compare, hash } from 'bcryptjs';

/**
 * POST /api/auth/change-password
 *
 * Changes the current user's password.
 * Expects: { currentPassword: string, newPassword: string }
 */
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number };
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'New password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { UserID: decoded.userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isMatch = await compare(currentPassword, user.PasswordHash);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Hash and save new password
        const hashedPassword = await hash(newPassword, 10);
        await prisma.user.update({
            where: { UserID: decoded.userId },
            data: { PasswordHash: hashedPassword },
        });

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
