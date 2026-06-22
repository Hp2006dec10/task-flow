import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/db';
import { TaskSchema } from '@/lib/definitions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const UpdateTaskSchema = TaskSchema.partial();

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = UpdateTaskSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        errors: validated.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    // Verify ownership of the task
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // If changing the list, verify ownership of the target list
    if (validated.data.listId && validated.data.listId !== task.listId) {
      const newList = await prisma.list.findUnique({
        where: { id: validated.data.listId },
      });
      if (!newList || newList.userId !== session.userId) {
        return NextResponse.json({ message: 'Invalid target list' }, { status: 403 });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('PUT task error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership of the task
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('DELETE task error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
