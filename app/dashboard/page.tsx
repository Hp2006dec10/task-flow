import { getSessionUser } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  // Check if anniversary list exists, if not create it
  const anniversaryExists = await prisma.list.findFirst({
    where: { userId: user.id, type: 'anniversary' },
  });

  if (!anniversaryExists) {
    await prisma.list.create({
      data: {
        name: 'Special Dates',
        type: 'anniversary',
        userId: user.id,
      },
    });
  }

  // Fetch initial lists, tasks and anniversaries for instantaneous render
  const initialLists = await prisma.list.findMany({
    where: { userId: user.id },
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

  return <DashboardClient user={user} initialLists={initialLists as any} />;
}
