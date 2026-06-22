import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/db';
import { TaskSchema } from '@/lib/definitions';

export async function POST(request: NextRequest) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = TaskSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        errors: validated.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { name, description, dueDate, priority, status, listId } = validated.data;

    // Verify ownership of the list
    const list = await prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return NextResponse.json({ message: 'Target list not found' }, { status: 404 });
    }

    if (list.userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        dueDate,
        priority,
        status,
        listId,
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('POST task error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
