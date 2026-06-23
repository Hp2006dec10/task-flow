import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailRemindersEnabled } = body;

    if (typeof emailRemindersEnabled !== 'boolean') {
      return NextResponse.json({ message: 'Invalid settings payload' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        emailRemindersEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        emailRemindersEnabled: updatedUser.emailRemindersEnabled,
      },
    });
  } catch (error) {
    console.error('PUT user settings error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
