import { prisma } from './prisma';
import { explainDiscrepancy } from './aiExplainer';

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function runReconciliation(batchId, uploadBatchId = null) {
  const existingRecons = await prisma.reconciliation.findMany({
    where: uploadBatchId ? { uploadBatchId } : {},
    select: { id: true },
  });
  const existingIds = existingRecons.map((r) => r.id);
  if (existingIds.length > 0) {
    await prisma.auditLog.deleteMany({ where: { reconciliationId: { in: existingIds } } });
    await prisma.exception.deleteMany({ where: { reconciliationId: { in: existingIds } } });
    await prisma.reconciliation.deleteMany({ where: { id: { in: existingIds } } });
  }

  const orders = await prisma.order.findMany({ where: uploadBatchId ? { uploadBatchId } : {} });
  const allTransfers = await prisma.routeTransfer.findMany({
    where: { source: { in: orders.map((o) => o.orderId) } },
  });
  const transfersBySource = {};
  for (const t of allTransfers) {
    (transfersBySource[t.source] ||= []).push(t);
  }

  let matched = 0;
  const toExplain = []; // { orderId (db id via recon), context data }
  const reconRecords = [];

  // Fast synchronous matching pass — no AI here
  for (const order of orders) {
    const transfers = transfersBySource[order.orderId] || [];
    const transfer = transfers[0];
    const isDuplicate = transfers.length > 1;
    const expectedSettled = order.amount - order.platformFee - order.tds - order.refund;
    let actualSettled = transfer ? transfer.amount : 0;

    let status = 'pending', category = null, context = '';

    if (!transfer) {
      status = 'exception'; category = 'missing_payout';
      context = `No Route transfer found for order ${order.orderId}`;
    } else if (isDuplicate) {
      status = 'exception'; category = 'duplicate_payout';
      context = `Found ${transfers.length} transfers for same order. Expected 1.`;
    } else if (transfer.onHold && transfer.onHoldUntil && transfer.onHoldUntil < Math.floor(Date.now() / 1000)) {
      status = 'exception'; category = 'chargeback_hold';
      context = `Hold expired on ${new Date(transfer.onHoldUntil * 1000).toLocaleDateString()} but still active`;
      actualSettled = transfer.amount;
    } else if (transfer.amountReversed > 0) {
      status = 'exception'; category = 'reversal_pending';
      context = `₹${(transfer.amountReversed / 100).toFixed(2)} reversed from vendor account`;
      actualSettled = transfer.amount;
    } else if (transfer.settlementStatus === 'failed') {
      status = 'exception'; category = 'settlement_failed';
      context = transfer.errorDescription || 'Settlement failed with no error description';
      actualSettled = transfer.amount;
    } else if (Math.abs(expectedSettled - transfer.amount) > 1) {
      status = 'exception'; category = 'amount_mismatch';
      context = `Expected ₹${(expectedSettled / 100).toFixed(2)} but transfer shows ₹${(transfer.amount / 100).toFixed(2)}`;
      actualSettled = transfer.amount;
    } else {
      status = 'matched'; matched++;
    }

    reconRecords.push({
      order, transfer, status, category, context, expectedSettled, actualSettled,
    });
  }

  // Bulk create Reconciliation rows, keep track of ids
  const createdRecons = [];
  for (const r of reconRecords) {
    const recon = await prisma.reconciliation.create({
      data: {
        batchId, uploadBatchId,
        orderId: r.order.orderId,
        transferId: r.transfer?.transferId || null,
        customerPaid: r.order.amount,
        routeSplit: r.transfer?.amount || 0,
        platformFee: r.order.platformFee,
        tdsDeducted: r.order.tds,
        chargebackHold: r.transfer?.onHold ? (r.expectedSettled - r.actualSettled) : 0,
        refundAmount: r.order.refund,
        finalSettled: r.actualSettled,
        fee: r.transfer?.fee || 0,
        tax: r.transfer?.tax || 0,
        status: r.status,
        matchConfidence: r.status === 'matched' ? 1.0 : 0.0,
        discrepancyCategory: r.category,
      },
    });
    createdRecons.push({ recon, r });
  }

  // AuditLogs — bulk insert
  await prisma.auditLog.createMany({
    data: createdRecons.map(({ recon, r }) => ({
      reconciliationId: recon.id,
      action: r.status === 'matched' ? 'MATCHED' : 'EXCEPTION_DETECTED',
      actor: 'system',
      details: { orderId: r.order.orderId, category: r.category, expectedAmount: r.expectedSettled, actualAmount: r.actualSettled },
    })),
  });

  // AI explanations — PARALLEL, in chunks of 5 to avoid rate limits
  const exceptionItems = createdRecons.filter(({ r }) => r.status === 'exception');
  const chunks = chunk(exceptionItems, 5);

  for (const group of chunks) {
    const results = await Promise.all(
      group.map(({ recon, r }) =>
        explainDiscrepancy({
          orderId: r.order.orderId,
          customerPaid: r.order.amount,
          routeSplit: r.transfer?.amount || 0,
          platformFee: r.order.platformFee,
          tdsDeducted: r.order.tds,
          chargebackHold: r.transfer?.onHold ? (r.expectedSettled - r.actualSettled) : 0,
          refundAmount: r.order.refund,
          finalSettled: r.actualSettled,
          fee: r.transfer?.fee || 0,
          tax: r.transfer?.tax || 0,
          onHold: r.transfer?.onHold || false,
          onHoldUntil: r.transfer?.onHoldUntil || null,
          amountReversed: r.transfer?.amountReversed || 0,
          settlementStatus: r.transfer?.settlementStatus || 'missing',
          errorDescription: r.transfer?.errorDescription || null,
          category: r.category,
          context: r.context,
        }).then((aiResult) => ({ recon, r, aiResult }))
      )
    );

    await prisma.exception.createMany({
      data: results.map(({ recon, r, aiResult }) => ({
        reconciliationId: recon.id,
        category: aiResult.category || r.category,
        description: r.context,
        aiExplanation: aiResult.explanation,
        confidenceScore: aiResult.confidence ?? 1.0,
        amountDiscrepancy: aiResult.amountDiscrepancy || Math.abs(r.expectedSettled - r.actualSettled),
        status: 'open',
      })),
    });
  }

  if (uploadBatchId) {
    await prisma.uploadBatch.update({ where: { id: uploadBatchId }, data: { status: 'reconciled' } });
  }

  return {
    batchId,
    total: orders.length,
    matched,
    exceptions: exceptionItems.length,
    matchRate: orders.length > 0 ? ((matched / orders.length) * 100).toFixed(1) : '0.0',
  };
}