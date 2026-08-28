import { getRazorpayClient, getDemoRazorpayClient } from '@/lib/razorpay';
import { decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const mode = body.mode || 'own'; // 'demo' or 'own'

  let razorpay;
  let fileLabel;

  if (mode === 'demo') {
    razorpay = getDemoRazorpayClient();
    fileLabel = `Razorpay Demo Sandbox Sync - ${new Date().toLocaleDateString('en-IN')}`;
  } else {
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
    });

    if (!company?.razorpayKeyId || !company?.razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay not connected yet' }, { status: 400 });
    }

    const decryptedSecret = decrypt(company.razorpayKeySecret);
    razorpay = getRazorpayClient(company.razorpayKeyId, decryptedSecret);
    fileLabel = `Razorpay Live Sync - ${new Date().toLocaleDateString('en-IN')}`;
  }

  const transfersResponse = await razorpay.transfers.all({ count: 50 });

  if (!transfersResponse.items || transfersResponse.items.length === 0) {
    return NextResponse.json({ error: 'No transfers found in this Razorpay test account' }, { status: 400 });
  }

  const batch = await prisma.uploadBatch.create({
    data: {
      companyId: session.user.companyId,
      fileName: fileLabel,
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