import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const companyId = session.user.companyId;

    const body = await request.json();
    const {
      fileName,
      ordersRaw,
      transfersRaw,
      bankRaw = [],
      gstRaw = [],
      orderMapping,
      transferMapping,
      bankMapping = {},
      gstMapping = {},
    } = body;

    if (!ordersRaw || !transfersRaw) {
      return new Response(JSON.stringify({ error: 'Missing required data' }), { status: 400 });
    }

    const batch = await prisma.uploadBatch.create({
      data: { companyId, fileName: fileName || 'uploaded.xlsx', orderCount: ordersRaw.length, status: 'uploaded' },
    });

const orderData = ordersRaw.map((row) => ({
  orderId: `${batch.id}_${String(row[orderMapping.order_id])}`,
  amount: Math.round(Number(row[orderMapping.amount]) * 100),
  customerId: String(row[orderMapping.customer_id] || 'unknown'),
  platformFee: orderMapping.platform_fee ? Math.round(Number(row[orderMapping.platform_fee] || 0) * 100) : 0,
  tds: orderMapping.tds ? Math.round(Number(row[orderMapping.tds] || 0) * 100) : 0,
  refund: orderMapping.refund ? Math.round(Number(row[orderMapping.refund] || 0) * 100) : 0,
  sellerId: orderMapping.seller_id ? String(row[orderMapping.seller_id]) : 'unknown',
  sellerType: orderMapping.seller_type ? String(row[orderMapping.seller_type] || 'unknown').toLowerCase() : 'unknown',
  panAvailable: orderMapping.pan_available
    ? !['no', 'false', '0', 'n'].includes(String(row[orderMapping.pan_available]).toLowerCase())
    : true,
  uploadBatchId: batch.id,
}));

    await prisma.order.createMany({ data: orderData, skipDuplicates: true });

    const transferData = transfersRaw.map((row) => ({
      transferId: `${batch.id}_${String(row[transferMapping.transfer_id])}`,
      source: `${batch.id}_${String(row[transferMapping.source])}`,
      recipient: String(row[transferMapping.recipient]),
      amount: Math.round(Number(row[transferMapping.amount]) * 100),
      onHold: transferMapping.on_hold ? Boolean(row[transferMapping.on_hold]) : false,
      onHoldUntil: transferMapping.on_hold_until && row[transferMapping.on_hold_until] ? Number(row[transferMapping.on_hold_until]) : null,
      amountReversed: transferMapping.amount_reversed ? Math.round(Number(row[transferMapping.amount_reversed] || 0) * 100) : 0,
      settlementStatus: transferMapping.settlement_status ? (row[transferMapping.settlement_status] || 'pending') : 'pending',
      fee: transferMapping.fee ? Math.round(Number(row[transferMapping.fee] || 0) * 100) : 0,
      tax: transferMapping.tax ? Math.round(Number(row[transferMapping.tax] || 0) * 100) : 0,
      errorDescription: transferMapping.error_description ? (row[transferMapping.error_description] || null) : null,
      createdAt: Math.floor(Date.now() / 1000),
    }));

    await prisma.routeTransfer.createMany({ data: transferData, skipDuplicates: true });

    // Bank Settlements (optional)
    if (bankRaw.length > 0 && bankMapping.utr && bankMapping.transfer_id) {
      const bankData = bankRaw.map((row) => ({
        utr: String(row[bankMapping.utr]),
        transferId: `${batch.id}_${String(row[bankMapping.transfer_id])}`, // must match transfer's prefixed ID
        amountCredited: Math.round(Number(row[bankMapping.amount_credited] || 0) * 100),
        creditedAt: bankMapping.credited_at && row[bankMapping.credited_at] ? new Date(row[bankMapping.credited_at]) : null,
        status: bankMapping.status ? (row[bankMapping.status] || 'pending') : 'pending',
        uploadBatchId: batch.id,
      }));

      await prisma.bankSettlement.createMany({ data: bankData, skipDuplicates: true });
    }

    // GST Filings (optional)
    if (gstRaw.length > 0 && gstMapping.vendor_gstin && gstMapping.order_id) {
      const gstData = gstRaw.map((row) => ({
        vendorGSTIN: String(row[gstMapping.vendor_gstin]),
        orderId: `${batch.id}_${String(row[gstMapping.order_id])}`, // must match order's prefixed ID
        tcsReported: Math.round(Number(row[gstMapping.tcs_reported] || 0) * 100),
        filingPeriod: String(row[gstMapping.filing_period] || ''),
        filedAt: gstMapping.filed_at && row[gstMapping.filed_at] ? new Date(row[gstMapping.filed_at]) : null,
        status: gstMapping.status ? (row[gstMapping.status] || 'pending') : 'pending',
        uploadBatchId: batch.id,
      }));

      await prisma.gSTFiling.createMany({ data: gstData, skipDuplicates: true });
    }

    return new Response(
      JSON.stringify({ success: true, batchId: batch.id, companyId }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Confirm error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}