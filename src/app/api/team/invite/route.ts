import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify, sign } from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    // 1. Security Check: Only Managers can invite
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as any;

    // Check if the requester is actually a Manager
    const requester = await prisma.user.findUnique({
      where: { UserID: decoded.userId }
    });

    if (requester?.Role !== 'Manager') {
      return NextResponse.json({ error: 'Only Managers can invite members' }, { status: 403 });
    }

    // 2. Get Input Data
    const body = await request.json();
    const { email, name, role } = body;

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { Email: email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // 4. Generate Random Password
    // Generates 8 random bytes and converts to a 16-character hex string
    const generatedPassword = randomBytes(8).toString('hex');
    const hashedPassword = await hash(generatedPassword, 10);

    // 5. Create the User in Database
    const newUser = await prisma.user.create({
      data: {
        Email: email,
        UserName: name || email.split('@')[0], // Fallback username
        PasswordHash: hashedPassword,
        Role: role || 'Employee',
      }
    });

    // 6. Generate a JWT invitation token for the /join page
    const inviteToken = sign(
      { userId: newUser.UserID, email: newUser.Email, purpose: 'team-invite' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const joinUrl = `${baseUrl}/join?token=${inviteToken}`;

    // 7. Send Email with both the temp password and the join link
    try {
      await transporter.sendMail({
        from: `"Daily Life" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `You're invited to Daily Life`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 24px; border-radius: 12px;">
            <h2 style="color: #7c3aed; text-align: center;">You've Been Invited!</h2>
            <p>Hi <strong>${newUser.UserName}</strong>,</p>
            <p>A manager has invited you to collaborate on the <strong>Task Management System</strong>.</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${joinUrl}"
                 style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Set Up Your Account
              </a>
            </div>
            
            <p style="font-size: 0.875rem; color: #6b7280;">Or you can log in directly with these credentials:</p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 12px 0;">
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0; margin-top: 8px;"><strong>Temporary Password:</strong> <code style="background: #eef2ff; padding: 2px 6px; border-radius: 4px;">${generatedPassword}</code></p>
            </div>
            <p style="color: #ef4444; font-size: 0.875rem;"><em>For security, please change your password after first login.</em></p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.75rem; color: #9ca3af; text-align: center;">This invitation link expires in 7 days.</p>
          </div>
        `,
      });

      return NextResponse.json({
        message: 'Employee added and invitation email sent!',
      }, { status: 201 });

    } catch (emailError) {
      console.error('Nodemailer Error:', emailError);
      return NextResponse.json({
        message: 'Employee created, but email failed to send. Share this link manually:',
        joinUrl,
        password: generatedPassword,
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Invite failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}