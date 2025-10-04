import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { sendResetEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a unique token
    const token = randomUUID();

    // Create password reset token document
    const resetToken = new PasswordResetToken({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    });

    await resetToken.save();

    // Construct reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Send reset email
    await sendResetEmail(user.email, resetLink);

    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
