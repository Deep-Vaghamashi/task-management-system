import { NextResponse } from 'next/server';

// Google OAuth — Placeholder endpoint
// To make this functional, you need:
// 1. Create a project at https://console.cloud.google.com
// 2. Enable Google+ API and create OAuth 2.0 credentials
// 3. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
// 4. Install `next-auth` or implement OAuth flow manually

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID in .env' },
            { status: 501 }
        );
    }

    // Redirect to Google's OAuth consent screen
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
    const scope = 'openid email profile';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(googleAuthUrl);
}
