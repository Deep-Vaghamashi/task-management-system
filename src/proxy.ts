import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Get the token from the cookies
  const token = request.cookies.get('token')?.value;

  // 2. Check if the token exists
  // If there is NO token, redirect them to the Login page
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. If the token is there, let them pass!
  return NextResponse.next();
}

// 4. Configure which paths this Guard protects
export const config = {
  matcher: ['/dashboard/:path*','/tasks/:path*'], // Protects /dashboard and any sub-pages
};