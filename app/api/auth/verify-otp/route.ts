import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/session';
import { VerifyOtpSchema } from '@/lib/definitions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = VerifyOtpSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({
        errors: validatedFields.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { email, otp } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again or resend.',
      }, { status: 400 });
    }

    // Find the verification OTP record in the dedicated table
    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        type: 'VERIFICATION',
      },
    });

    if (!otpRecord) {
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again or resend.',
      }, { status: 400 });
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      // Clean up the expired row immediately
      await prisma.otp.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again or resend.',
      }, { status: 400 });
    }

    // Compare hashed OTP code
    const isMatch = await bcrypt.compare(otp, otpRecord.code);
    if (!isMatch) {
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again or resend.',
      }, { status: 400 });
    }

    // Match found (OTP is used): Clean up the row immediately
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    // Mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });

    // Create session
    await createSession(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OTP Verification error:', error);
    return NextResponse.json({
      message: 'Something went wrong. Please try again.',
    }, { status: 500 });
  }
}
