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

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { Email: email.trim() },
        });

        // Always return success to avoid email enumeration attacks
        if (!user) {
            return NextResponse.json({
                message: 'If an account with that email exists, we have sent a password reset link.',
            });
        }

        // Generate a short-lived reset token (15 minutes)
        const resetToken = sign(
            { userId: user.UserID, purpose: 'password-reset' },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );

        // Build the reset URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        // Send the email
        try {
            await transporter.sendMail({
                from: `"Daily Life" <${process.env.EMAIL_USER}>`,
                to: email.trim(),
                subject: 'Reset Your Password — Daily Life',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 24px; border-radius: 12px;">
            <h2 style="color: #7c3aed; text-align: center;">Password Reset Request</h2>
            <p>Hi <strong>${user.UserName}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 0.875rem; color: #6b7280;">This link expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.75rem; color: #9ca3af; text-align: center;">Daily Life — Task Management System</p>
          </div>
        `,
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            // Don't expose email errors to the user
        }

        return NextResponse.json({
            message: 'If an account with that email exists, we have sent a password reset link.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
