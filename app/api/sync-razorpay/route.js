import { getRazorpayClient } from '@/lib/razorpay';
import { decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as XLSX from 'xlsx';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const mode = body.mode || 'own';

  // DEMO MODE — read seed Excel file with all 4 data sources
  if (mode === 'demo') {
    try {
      const filePath = join(process.cwd(), 'data', 'reconai_full_demo_batch_50plus.xlsx');
      const fileBuffer = await readFile(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      const sheetNames = workbook.SheetNames;
      const ordersRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
      const transfersRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]]);
      const bankRaw = sheetNames[2] ? XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[2]]) : [];
      const gstRaw = sheetNames[3] ? XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[3]]) : [];

      if (ordersRaw.length === 0 || transfersRaw.length === 0) {
        return NextResponse.json({ error: 'Demo seed file is empty' }, { status: 500 });
      }

      const batch = await prisma.uploadBatch.create({
        data: {
          companyId: session.user.companyId,
          fileName: `Demo Dataset — ${ordersRaw.length} orders · ${new Date().toLocaleDateString('en-IN')}`,
          status: 'uploaded',
        },
      });

      // Orders
      const orderData = ordersRaw.map((row) => ({
        orderId: `${batch.id}_${row.order_id}`,
        amount: Math.round(Number(row.amount) * 100),
        customerId: String(row.customer_id || 'unknown'),
        platformFee: Math.round(Number(row.platform_fee || 0) * 100),
        tds: Math.round(Number(row.tds || 0) * 100),
        refund: Math.round(Number(row.refund || 0) * 100),
        sellerId: String(row.seller_id || 'unknown'),
        sellerType: String(row.seller_type || 'unknown').toLowerCase(),
        panAvailable: !['no', 'false', '0', 'n'].includes(String(row.pan_available || 'yes').toLowerCase()),
        uploadBatchId: batch.id,
      }));
      await prisma.order.createMany({ data: orderData, skipDuplicates: true });

      // Route Transfers
      const transferData = transfersRaw.map((row) => ({
        transferId: `${batch.id}_${row.transfer_id}`,
        source: `${batch.id}_${row.source}`,
        recipient: String(row.recipient),
        amount: Math.round(Number(row.amount) * 100),
        onHold: String(row.on_hold).toLowerCase() === 'yes' || row.on_hold === true,
        onHoldUntil: row.on_hold_until ? Math.floor(new Date(row.on_hold_until).getTime() / 1000) : null,
        amountReversed: Math.round(Number(row.amount_reversed || 0) * 100),
        settlementStatus: String(row.settlement_status || 'pending'),
        fee: Math.round(Number(row.fee || 0) * 100),
        tax: Math.round(Number(row.tax || 0) * 100),
        errorDescription: row.error_description || null,
        createdAt: Math.floor(Date.now() / 1000),
      }));
      await prisma.routeTransfer.createMany({ data: transferData, skipDuplicates: true });

      // Bank Settlements
      if (bankRaw.length > 0) {
        const bankData = bankRaw.map((row) => ({
          utr: String(row.utr),
          transferId: `${batch.id}_${row.transfer_id}`,
          amountCredited: Math.round(Number(row.amount_credited || 0) * 100),
          creditedAt: row.credited_at ? new Date(row.credited_at) : null,
          status: String(row.status || 'pending'),
          uploadBatchId: batch.id,
        }));
        await prisma.bankSettlement.createMany({ data: bankData, skipDuplicates: true });
      }

      // GST Filings
      if (gstRaw.length > 0) {
        const gstData = gstRaw.map((row) => ({
          vendorGSTIN: String(row.vendor_gstin),
          orderId: `${batch.id}_${row.order_id}`,
          tcsReported: Math.round(Number(row.tcs_reported || 0) * 100),
          filingPeriod: String(row.filing_period || ''),
          status: String(row.status || 'pending'),
          uploadBatchId: batch.id,
        }));
        await prisma.gSTFiling.createMany({ data: gstData, skipDuplicates: true });
      }

      await prisma.uploadBatch.update({
        where: { id: batch.id },
        data: { orderCount: ordersRaw.length },
      });

      return NextResponse.json({
        success: true,
        batchId: batch.id,
        count: ordersRaw.length,
        sources: {
          orders: ordersRaw.length,
          transfers: transfersRaw.length,
          bankSettlements: bankRaw.length,
          gstFilings: gstRaw.length,
        },
      });
    } catch (err) {
      console.error('Demo seed load error:', err);
      return NextResponse.json({ error: 'Failed to load demo data: ' + err.message }, { status: 500 });
    }
  }

  // OWN MODE — live Razorpay test account sync
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  });

  if (!company?.razorpayKeyId || !company?.razorpayKeySecret) {
    return NextResponse.json({ error: 'Razorpay not connected yet' }, { status: 400 });
  }

  const decryptedSecret = decrypt(company.razorpayKeySecret);
  const razorpay = getRazorpayClient(company.razorpayKeyId, decryptedSecret);
  const fileLabel = `Razorpay Live Sync — ${new Date().toLocaleDateString('en-IN')}`;

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
