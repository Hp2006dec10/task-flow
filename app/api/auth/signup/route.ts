import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';
import { SignupSchema } from '@/lib/definitions';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = SignupSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({
        errors: validatedFields.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { name, email, password } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({
          message: 'An account with this email already exists.',
        }, { status: 400 });
      }

      // Check if they already have an active verification code in the database
      const activeOtp = await prisma.otp.findFirst({
        where: {
          userId: existingUser.id,
          type: 'VERIFICATION',
          expiresAt: { gt: new Date() },
        },
      });

      if (activeOtp) {
        return NextResponse.json({
          success: false,
          activeOtp: true,
          message: 'An active verification code is already sent to your email. Redirecting you to verification...',
        });
      }

      // Clean up any expired verification OTPs for this user
      await prisma.otp.deleteMany({
        where: {
          userId: existingUser.id,
          type: 'VERIFICATION',
        },
      });

      // Update name/password for unverified signup re-attempt
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      const otpHash = await bcrypt.hash(otp, 10);

      await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
        },
      });

      await prisma.otp.create({
        data: {
          userId: existingUser.id,
          code: otpHash,
          type: 'VERIFICATION',
          expiresAt: otpExpiry,
        },
      });

      await sendOtpEmail(email, name, otp);
      return NextResponse.json({ success: true, message: 'Verification OTP sent.' });
    }

    // Create unverified user
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const otpHash = await bcrypt.hash(otp, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    await prisma.otp.create({
      data: {
        userId: newUser.id,
        code: otpHash,
        type: 'VERIFICATION',
        expiresAt: otpExpiry,
      },
    });

    await sendOtpEmail(email, name, otp);
    return NextResponse.json({ success: true, message: 'Verification OTP sent.' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      message: 'Something went wrong. Please try again.',
    }, { status: 500 });
  }
}
