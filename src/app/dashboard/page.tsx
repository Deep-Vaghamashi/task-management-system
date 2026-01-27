import React from 'react';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import LogoutButton from '@/components/LogoutButton'; // Import our new button

export default async function DashboardPage() {
  // 1. Get the cookie directly from the request
  const cookieStore = cookies();
  const token = (await cookieStore).get('token');

  let username = "Guest";

  if (token) {
    try {
      // 2. Open the wristband (Verify and Decode)
      // We cast it as 'any' here for simplicity, but in a real app, define an interface!
      const decoded = verify(token.value, process.env.JWT_SECRET!) as any;
      
      // 3. Grab the username we saved earlier
      username = decoded.username; 
    } catch (error) {
      console.error("Token verification failed");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome, {username}! 👋</h1>
      <p className="mt-4 text-xl mb-8">
        This page is rendered on the server.
      </p>

      {/* The Client Component sits here comfortably */}
      <LogoutButton />
    </div>
  );
}