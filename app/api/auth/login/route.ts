import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/session';
import { sendOtpEmail } from '@/lib/email';
import { LoginSchema } from '@/lib/definitions';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = LoginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({
        errors: validatedFields.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { email, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        message: 'Invalid email or password.',
      }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({
        message: 'Invalid email or password.',
      }, { status: 400 });
    }

    if (!user.isVerified) {
      // Check if they already have an active verification code
      const activeOtp = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          type: 'VERIFICATION',
          expiresAt: { gt: new Date() },
        },
      });

      if (activeOtp) {
        return NextResponse.json({
          success: false,
          unverified: true,
          activeOtp: true,
          message: 'Your account is unverified. An active verification code has already been sent to your email. Redirecting...',
          errors: { otp: ['Unverified account. Redirecting...'] },
        });
      }

      // No active OTP: clean up and issue a new one
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

      return NextResponse.json({
        success: false,
        unverified: true,
        message: 'Your account is unverified. We sent a new verification code to your email.',
        errors: { otp: ['Unverified account. Redirecting...'] },
      });
    }

    // Success: Create session
    await createSession(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      message: 'Something went wrong. Please try again.',
    }, { status: 500 });
  }
}
