import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { companyName, companyEmail, fileName, ordersRaw, transfersRaw, orderMapping, transferMapping } = body;

    if (!companyName || !companyEmail || !ordersRaw || !transfersRaw) {
      return new Response(JSON.stringify({ error: 'Missing required data' }), { status: 400 });
    }

    let company = await prisma.company.findUnique({ where: { email: companyEmail } });
    if (!company) {
      company = await prisma.company.create({ data: { name: companyName, email: companyEmail } });
    }

    const batch = await prisma.uploadBatch.create({
      data: { companyId: company.id, fileName: fileName || 'uploaded.xlsx', orderCount: ordersRaw.length, status: 'uploaded' },
    });

    const orderData = ordersRaw.map((row) => ({
      orderId: `${batch.id}_${String(row[orderMapping.order_id])}`, // prefixed to avoid cross-batch collisions
      amount: Math.round(Number(row[orderMapping.amount]) * 100),
      customerId: String(row[orderMapping.customer_id] || 'unknown'),
      platformFee: orderMapping.platform_fee ? Math.round(Number(row[orderMapping.platform_fee] || 0) * 100) : 0,
      tds: orderMapping.tds ? Math.round(Number(row[orderMapping.tds] || 0) * 100) : 0,
      refund: orderMapping.refund ? Math.round(Number(row[orderMapping.refund] || 0) * 100) : 0,
      uploadBatchId: batch.id,
    }));

    await prisma.order.createMany({ data: orderData, skipDuplicates: true });

    const transferData = transfersRaw.map((row) => ({
      transferId: `${batch.id}_${String(row[transferMapping.transfer_id])}`,
      source: `${batch.id}_${String(row[transferMapping.source])}`, // must match prefixed orderId
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

    return new Response(
      JSON.stringify({ success: true, batchId: batch.id, companyId: company.id }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Confirm error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}