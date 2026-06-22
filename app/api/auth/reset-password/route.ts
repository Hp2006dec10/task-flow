import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { ResetPasswordSchema } from '@/lib/definitions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = ResetPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({
        errors: validatedFields.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { email, otp, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again.',
      }, { status: 400 });
    }

    // Find the password reset OTP record in the dedicated table
    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET',
      },
    });

    if (!otpRecord) {
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again.',
      }, { status: 400 });
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      // Clean up the expired row immediately
      await prisma.otp.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again.',
      }, { status: 400 });
    }

    // Compare hashed reset OTP code
    const isMatch = await bcrypt.compare(otp, otpRecord.code);
    if (!isMatch) {
      return NextResponse.json({
        message: 'Invalid or expired OTP. Please try again.',
      }, { status: 400 });
    }

    // Match found (OTP is used): Clean up the row immediately
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    // Reset password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      message: 'Something went wrong. Please try again.',
    }, { status: 500 });
  }
}
