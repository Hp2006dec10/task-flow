import { getSessionUser } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch initial lists and tasks for instantaneous render
  const initialLists = await prisma.list.findMany({
    where: { userId: user.id },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return <DashboardClient user={user} initialLists={initialLists} />;
}
