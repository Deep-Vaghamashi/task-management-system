import { NextResponse } from 'next/server';

// GitHub OAuth — Placeholder endpoint
// To make this functional, you need:
// 1. Go to https://github.com/settings/developers
// 2. Create a new OAuth App
// 3. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env
// 4. Install `next-auth` or implement OAuth flow manually

export async function GET() {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID in .env' },
            { status: 501 }
        );
    }

    // Redirect to GitHub's OAuth authorization page
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`;
    const scope = 'read:user user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    return NextResponse.redirect(githubAuthUrl);
}
