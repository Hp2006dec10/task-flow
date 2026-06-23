import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/db';
import { AnniversarySchema } from '@/lib/definitions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const UpdateAnniversarySchema = AnniversarySchema.partial();

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = UpdateAnniversarySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        errors: validated.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    // Verify ownership of the anniversary
    const anniversary = await prisma.anniversary.findUnique({
      where: { id },
    });

    if (!anniversary) {
      return NextResponse.json({ message: 'Anniversary not found' }, { status: 404 });
    }

    if (anniversary.userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // If changing the list, verify ownership of the target list and that it is an anniversary list
    if (validated.data.listId && validated.data.listId !== anniversary.listId) {
      const newList = await prisma.list.findUnique({
        where: { id: validated.data.listId },
      });
      if (!newList || newList.userId !== session.userId) {
        return NextResponse.json({ message: 'Invalid target list' }, { status: 403 });
      }
      if (newList.type !== 'anniversary') {
        return NextResponse.json({ message: 'Cannot move an anniversary to a regular list' }, { status: 400 });
      }
    }

    const updatedAnniversary = await prisma.anniversary.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json({ success: true, anniversary: updatedAnniversary });
  } catch (error) {
    console.error('PUT anniversary error:', error);
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

    // Verify ownership of the anniversary
    const anniversary = await prisma.anniversary.findUnique({
      where: { id },
    });

    if (!anniversary) {
      return NextResponse.json({ message: 'Anniversary not found' }, { status: 404 });
    }

    if (anniversary.userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.anniversary.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Anniversary deleted successfully' });
  } catch (error) {
    console.error('DELETE anniversary error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
