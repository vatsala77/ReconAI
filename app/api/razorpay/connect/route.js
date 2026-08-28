import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRazorpayClient } from '@/lib/razorpay';
import { encrypt } from '@/lib/encryption';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { keyId, keySecret } = await req.json();

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Both Key ID and Key Secret are required' }, { status: 400 });
  }

  if (!keyId.startsWith('rzp_test_')) {
    return NextResponse.json({ error: 'Only test-mode keys (starting with rzp_test_) are accepted' }, { status: 400 });
  }

  try {
    const client = getRazorpayClient(keyId, keySecret);
    await client.payments.all({ count: 1 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid credentials — could not authenticate with Razorpay' }, { status: 400 });
  }

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { razorpayKeyId: keyId, razorpayKeySecret: encrypt(keySecret) },
  });

  return NextResponse.json({ success: true, keyId });
}