import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendForgotPasswordEmail } from '@/lib/email';
import { ForgotPasswordSchema } from '@/lib/definitions';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = ForgotPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({
        errors: validatedFields.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { email } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isVerified) {
      // Check for active reset OTP in the database
      const activeOtp = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          type: 'PASSWORD_RESET',
          expiresAt: { gt: new Date() },
        },
      });

      if (activeOtp) {
        return NextResponse.json({
          success: true,
          message: 'An active password reset code has already been sent to your email. Please check your inbox.',
        });
      }

      // Clean up old reset OTP rows for this user
      await prisma.otp.deleteMany({
        where: {
          userId: user.id,
          type: 'PASSWORD_RESET',
        },
      });

      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
      const otpHash = await bcrypt.hash(otp, 10);

      await prisma.otp.create({
        data: {
          userId: user.id,
          code: otpHash,
          type: 'PASSWORD_RESET',
          expiresAt: otpExpiry,
        },
      });

      await sendForgotPasswordEmail(email, user.name, otp);
    }

    // Return generic success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If the email matches a verified account, we have sent a password reset OTP.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      message: 'Something went wrong. Please try again.',
    }, { status: 500 });
  }
}
