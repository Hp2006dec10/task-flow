import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { decrypt } from './session';
import { prisma } from './db';

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/login');
  }

  return { isAuth: true, userId: session.userId };
});

export const getSessionUser = cache(async () => {
  const cookie = (await cookies()).get('session')?.value;
  if (!cookie) return null;
  const session = await decrypt(cookie);
  if (!session?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        emailRemindersEnabled: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
});
