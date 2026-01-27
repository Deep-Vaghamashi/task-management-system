import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, username } = body;

        if (!email || !password || !username) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique(
            { where: { Email: email } }
        );

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }//confilct user
            );
        }

        const hasedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                Email: email,
                UserName: username,
                PasswordHash: hasedPassword,
            }
        });

        return NextResponse.json(
            { message: 'User registered successfully', userId: newUser.UserID },
            { status: 201 }
        );
    }
    catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}