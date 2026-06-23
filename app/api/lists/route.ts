import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ListSchema } from '@/lib/definitions';

export async function GET(request: NextRequest) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const lists = await prisma.list.findMany({
      where: { userId: session.userId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        anniversaries: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, lists });
  } catch (error) {
    console.error('GET lists error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = ListSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        errors: validated.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const list = await prisma.list.create({
      data: {
        name: validated.data.name,
        userId: session.userId,
        type: 'regular',
      },
      include: {
        tasks: true,
        anniversaries: true,
      },
    });

    return NextResponse.json({ success: true, list });
  } catch (error) {
    console.error('POST list error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
