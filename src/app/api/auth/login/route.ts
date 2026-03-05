import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    // 1. Find the user (Search by Email OR Username)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { Email: identifier },
          { UserName: identifier }
        ]
      }
    });

    // 2. If user doesn't exist, stop here
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Check if the password is correct
    // We compare the PLAIN password (input) with the HASHED password (database)
    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Create a JWT token
    const token = sign(
      { userId: user.UserID, username: user.UserName },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json(
      { message: "Login successful!", userId: user.UserID, token: token },
      { status: 200 }
    );

    // Cookie setup for token
    response.cookies.set("token", token, {           // note response instead of request  
      httpOnly: true,                                // Security: JS cannot read this
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "strict",                            // Protect against CSRF attacks
      maxAge: 3600,                                  // Expires in 1 hour (your calculation!)
      path: "/",                                     // Available on all pages
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}