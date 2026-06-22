import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Account is already verified.' }, { status: 400 });
    }

    // Check if user already has an active, unexpired verification OTP
    const activeOtp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        type: 'VERIFICATION',
        expiresAt: { gt: new Date() },
      },
    });

    if (activeOtp) {
      return NextResponse.json({
        message: 'An active verification code has already been sent to your email. Please check your inbox or wait before requesting another.',
      }, { status: 400 });
    }

    // Clean up old verification OTP rows
    await prisma.otp.deleteMany({
      where: {
        userId: user.id,
        type: 'VERIFICATION',
      },
    });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.otp.create({
      data: {
        userId: user.id,
        code: otpHash,
        type: 'VERIFICATION',
        expiresAt: otpExpiry,
      },
    });

    await sendOtpEmail(email, user.name, otp);
    return NextResponse.json({ success: true, message: 'New OTP sent successfully!' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ message: 'Failed to resend OTP. Please try again.' }, { status: 500 });
  }
}
