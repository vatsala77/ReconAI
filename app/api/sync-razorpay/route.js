import { razorpay } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transfersResponse = await razorpay.transfers.all({ count: 50 });

  if (!transfersResponse.items || transfersResponse.items.length === 0) {
    return NextResponse.json({ error: 'No transfers found in Razorpay test mode' }, { status: 400 });
  }

  const batch = await prisma.uploadBatch.create({
    data: {
      companyId: session.user.companyId,
      fileName: `Razorpay Live Sync - ${new Date().toLocaleDateString('en-IN')}`,
      status: 'uploaded',
    },
  });

  let processedCount = 0;

  for (const transfer of transfersResponse.items) {
    try {
      const payment = await razorpay.payments.fetch(transfer.source);

      await prisma.order.upsert({
        where: { orderId: transfer.source },
        update: {},
        create: {
          orderId: transfer.source,
          amount: payment.amount,
          customerId: payment.email || payment.contact || 'unknown',
          sellerId: transfer.recipient,
          uploadBatchId: batch.id,
        },
      });

      await prisma.routeTransfer.create({
        data: {
          transferId: transfer.id,
          source: transfer.source,
          recipient: transfer.recipient,
          amount: transfer.amount,
          onHold: transfer.on_hold || false,
          onHoldUntil: transfer.on_hold_until || null,
          settlementStatus: transfer.status || 'pending',
          fee: transfer.fees || 0,
          tax: transfer.tax || 0,
          createdAt: transfer.created_at,
        },
      });

      processedCount++;
    } catch (err) {
      console.error(`Failed to process transfer ${transfer.id}:`, err.message);
    }
  }

  await prisma.uploadBatch.update({
    where: { id: batch.id },
    data: { orderCount: processedCount },
  });

  return NextResponse.json({ success: true, batchId: batch.id, count: processedCount });
}