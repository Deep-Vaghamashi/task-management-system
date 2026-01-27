import { NextResponse } from "next/server";

export async function POST() {
  // 1. Create a standard response
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  // 2. The Magic: Tell the browser to delete the cookie 🗑️
  response.cookies.delete("token");

  return response;
}