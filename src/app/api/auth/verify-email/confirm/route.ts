import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

interface VerificationPayload {
    userId: number;
    email: string;
    code: string;
    purpose: string;
}

export async function POST(request: Request) {
    try {
        const { token, code } = await request.json();

        if (!token || !code) {
            return NextResponse.json(
                { error: 'Verification token and code are required' },
                { status: 400 }
            );
        }

        // Verify the JWT token
        let decoded: VerificationPayload;
        try {
            decoded = verify(token, process.env.JWT_SECRET!) as VerificationPayload;
        } catch (tokenError) {
            return NextResponse.json(
                { error: 'Verification link has expired or is invalid. Please request a new code.' },
                { status: 400 }
            );
        }

        // Check purpose
        if (decoded.purpose !== 'email-verification') {
            return NextResponse.json({ error: 'Invalid token purpose' }, { status: 400 });
        }

        // Compare the code
        if (decoded.code !== code.trim()) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        // Verification successful
        return NextResponse.json({
            message: 'Email verified successfully!',
            userId: decoded.userId,
            email: decoded.email,
        });
    } catch (error) {
        console.error('Verify email confirm error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
