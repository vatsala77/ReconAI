import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { razorpayKeyId: null, razorpayKeySecret: null },
  });

  return NextResponse.json({ success: true });
}