import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardUI from '@/components/DashboardUI';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.companyId) {
    redirect('/login');
  }

  const uploads = await prisma.uploadBatch.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: 'desc' },
  });

  return <DashboardUI session={session} uploads={uploads} />;
}