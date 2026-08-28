import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UploadsList from '@/components/UploadsList';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.companyId) {
    redirect('/login');
  }

  const [uploads, company] = await Promise.all([
    prisma.uploadBatch.findMany({
      where: { companyId: session.user.companyId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { razorpayKeyId: true },
    }),
  ]);

  return (
    <UploadsList
      uploads={uploads}
      isRazorpayConnected={!!company?.razorpayKeyId}
      razorpayKeyId={company?.razorpayKeyId || null}
      user={session.user}
    />
  );
}