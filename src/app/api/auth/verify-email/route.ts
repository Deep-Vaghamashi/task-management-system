import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.trim()) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { Email: email.trim() },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Create a JWT token containing the code and user info (expires in 10 minutes)
        const verificationToken = sign(
            { userId: user.UserID, email: user.Email, code, purpose: 'email-verification' },
            process.env.JWT_SECRET!,
            { expiresIn: '10m' }
        );

        // Send the verification email
        try {
            await transporter.sendMail({
                from: `"Daily Life" <${process.env.EMAIL_USER}>`,
                to: email.trim(),
                subject: 'Verify Your Email — Daily Life',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 24px; border-radius: 12px;">
            <h2 style="color: #7c3aed; text-align: center;">Email Verification</h2>
            <p>Hi <strong>${user.UserName}</strong>,</p>
            <p>Welcome to Daily Life! Please use the following code to verify your email address:</p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="display: inline-block; background-color: #f3f4f6; border: 2px dashed #7c3aed; padding: 16px 32px; border-radius: 12px; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #7c3aed;">
                ${code}
              </div>
            </div>
            <p style="font-size: 0.875rem; color: #6b7280;">This code expires in <strong>10 minutes</strong>. If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.75rem; color: #9ca3af; text-align: center;">Daily Life — Task Management System</p>
          </div>
        `,
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            return NextResponse.json(
                { error: 'Failed to send verification email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Verification code sent to your email.',
            token: verificationToken,
        });
    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
