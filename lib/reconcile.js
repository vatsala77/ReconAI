import { prisma } from './prisma';
import { explainDiscrepancy } from './aiExplainer';
import { verifyTaxLines } from './taxLineMatcher';

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

  const allBankSettlements = uploadBatchId
    ? await prisma.bankSettlement.findMany({ where: { uploadBatchId } })
    : [];
  const bankByTransferId = {};
  for (const b of allBankSettlements) {
    bankByTransferId[b.transferId] = b;
  }

  const allGSTFilings = uploadBatchId
    ? await prisma.gSTFiling.findMany({ where: { uploadBatchId } })
    : [];
  const gstByOrderId = {};
  for (const g of allGSTFilings) {
    gstByOrderId[g.orderId] = g;
  }

  const reconRecords = [];

  // Matching pass — no AI here, includes multi-source + tax-line checks
  for (const order of orders) {
    const transfers = transfersBySource[order.orderId] || [];
    const transfer = transfers[0];
    const isDuplicate = transfers.length > 1;
    const expectedSettled = order.amount - order.platformFee - order.tds - order.refund;
    let actualSettled = transfer ? transfer.amount : 0;

    let status = 'pending', category = null, context = '', amountDiscrepancy = 0;

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
      amountDiscrepancy = Math.abs(expectedSettled - actualSettled);
    } else {
      status = 'matched';
    }

    // LAYER 2: Bank Settlement check
    if (status === 'matched' && transfer) {
      const bankSettlement = bankByTransferId[transfer.transferId];
      if (bankSettlement) {
        if (bankSettlement.status === 'pending' || !bankSettlement.creditedAt) {
          status = 'exception';
          category = 'bank_credit_delayed';
          context = `Route shows settled, but bank credit (UTR: ${bankSettlement.utr}) is still pending — allow 1-2 business days for IMPS/NEFT/RTGS confirmation`;
        } else if (Math.abs(bankSettlement.amountCredited - transfer.amount) > 1) {
          status = 'exception';
          category = 'bank_amount_mismatch';
          context = `Route transferred ₹${(transfer.amount / 100).toFixed(2)} but bank credited ₹${(bankSettlement.amountCredited / 100).toFixed(2)} (UTR: ${bankSettlement.utr}) — check for intermediary bank charges or IFSC mismatch`;
          amountDiscrepancy = Math.abs(bankSettlement.amountCredited - transfer.amount);
        }
      }
    }

    // LAYER 3: GST Filing check — TCS is 1% of NET value (gross − sales returns − discounts) under Sec 52 CGST
    if (status === 'matched') {
      const gstFiling = gstByOrderId[order.orderId];
      if (gstFiling) {
        const netTaxableValue = order.amount - order.refund; // gross − sales returns (no separate discount field)
        const expectedTCS = Math.round(netTaxableValue * 0.01);
        if (Math.abs(gstFiling.tcsReported - expectedTCS) > 1) {
          status = 'exception';
          category = 'gst_tcs_mismatch';
          context = `Expected TCS ₹${(expectedTCS / 100).toFixed(2)} (1% of net taxable value ₹${(netTaxableValue / 100).toFixed(2)} under Section 52 CGST) but GST filing shows ₹${(gstFiling.tcsReported / 100).toFixed(2)}`;
          amountDiscrepancy = Math.abs(gstFiling.tcsReported - expectedTCS);
        }
      }
    }

    if (status === 'exception' && amountDiscrepancy === 0) {
      amountDiscrepancy = Math.abs(expectedSettled - actualSettled);
    }

    reconRecords.push({
      order, transfer, status, category, context, expectedSettled, actualSettled, amountDiscrepancy, taxIssues: [],
    });
  }

  // Tax checks may query seller totals, so run them concurrently after the matching pass.
  await Promise.all(
    reconRecords.map(async (record) => {
      if (record.status !== 'matched' || !record.transfer) return;

      record.taxIssues = await verifyTaxLines(record.order, record.transfer);
      if (record.taxIssues.length > 0) {
        record.status = 'exception';
        record.category = 'tax_line_discrepancy';
        record.amountDiscrepancy = record.taxIssues.reduce(
          (total, issue) => total + Math.abs(issue.expected - issue.actual),
          0
        );
        record.context = record.taxIssues
          .map((issue) => `${issue.line}: expected ₹${(issue.expected / 100).toFixed(2)}, actual ₹${(issue.actual / 100).toFixed(2)} (${issue.rule})`)
          .join(' | ');
      }
    })
  );

  // Count matched AFTER all layers have run (fixes premature counting)
  const matched = reconRecords.filter((r) => r.status === 'matched').length;

  // Batch insert reconciliation records for better performance
  const reconData = reconRecords.map((r) => ({
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
  }));
  
  const createdRecords = await prisma.reconciliation.createMany({ data: reconData });
  
  // Fetch created records to get IDs for audit logs
  const createdRecons = [];
  const createdOrderIds = reconRecords.map(r => r.order.orderId);
  const allCreated = await prisma.reconciliation.findMany({
    where: { batchId, orderId: { in: createdOrderIds } },
    select: { id: true, orderId: true }
  });
  const createdByOrderId = new Map(allCreated.map((record) => [record.orderId, record]));
  
  for (const r of reconRecords) {
    const recon = createdByOrderId.get(r.order.orderId);
    if (recon) createdRecons.push({ recon, r });
  }

  await prisma.auditLog.createMany({
    data: createdRecons.map(({ recon, r }) => ({
      reconciliationId: recon.id,
      action: r.status === 'matched' ? 'MATCHED' : 'EXCEPTION_DETECTED',
      actor: 'system',
      details: { orderId: r.order.orderId, category: r.category, expectedAmount: r.expectedSettled, actualAmount: r.actualSettled },
    })),
  });

  const exceptionItems = createdRecons.filter(({ r }) => r.status === 'exception');
  const chunks = chunk(exceptionItems, 20); // Process 20 exceptions in parallel for speed

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
        category: r.category,
        description: r.context,
        aiExplanation: aiResult.explanation,
        confidenceScore: aiResult.confidence ?? 1.0,
        amountDiscrepancy: r.amountDiscrepancy,
        status: 'open',
        taxLineBreakdown: r.taxIssues && r.taxIssues.length > 0 ? r.taxIssues : null,
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