import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ListSchema } from '@/lib/definitions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = ListSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        errors: validated.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    // Verify ownership of the list
    const list = await prisma.list.findUnique({
      where: { id },
    });

    if (!list) {
      return NextResponse.json({ message: 'List not found' }, { status: 404 });
    }

    if (list.userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (list.type === 'anniversary') {
      return NextResponse.json({ message: 'Cannot rename the system special dates list' }, { status: 400 });
    }

    const updatedList = await prisma.list.update({
      where: { id },
      data: {
        name: validated.data.name,
      },
    });

    return NextResponse.json({ success: true, list: updatedList });
  } catch (error) {
    console.error('PUT list error:', error);
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

    // Verify ownership of the list
    const list = await prisma.list.findUnique({
      where: { id },
    });

    if (!list) {
      return NextResponse.json({ message: 'List not found' }, { status: 404 });
    }

    if (list.userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (list.type === 'anniversary') {
      return NextResponse.json({ message: 'Cannot delete the system special dates list' }, { status: 400 });
    }

    await prisma.list.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'List deleted successfully' });
  } catch (error) {
    console.error('DELETE list error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
