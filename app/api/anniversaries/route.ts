import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { prisma } from '@/lib/db';
import { AnniversarySchema } from '@/lib/definitions';

export async function POST(request: NextRequest) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = AnniversarySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({
        errors: validated.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { name, description, date, listId, isImportant, reminderTime } = validated.data;

    // Fetch user settings to check if they opted out of email reminders entirely
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify ownership of the list and check if it is an anniversary list
    const list = await prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return NextResponse.json({ message: 'Target list not found' }, { status: 404 });
    }

    if (list.userId !== session.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (list.type !== 'anniversary') {
      return NextResponse.json({ message: 'Cannot add an anniversary to a regular list' }, { status: 400 });
    }

    // If user opted out entirely, default new anniversaries to not important (no reminder)
    const finalIsImportant = body.isImportant !== undefined ? isImportant : user.emailRemindersEnabled;

    const anniversary = await prisma.anniversary.create({
      data: {
        name,
        description,
        date,
        isImportant: finalIsImportant,
        reminderTime,
        listId,
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, anniversary });
  } catch (error) {
    console.error('POST anniversary error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
