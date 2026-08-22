const { prisma } = require('./prisma');

async function runReconciliation(batchId) {
  const orders = await prisma.order.findMany();
  let matched = 0;
  let exceptions = 0;

  for (const order of orders) {
    // Find transfers linked to this order via source field
    const transfers = await prisma.routeTransfer.findMany({
      where: { source: order.orderId },
    });

    const transfer = transfers[0];
    const isDuplicate = transfers.length > 1;

    // What should the settled amount be?
    const expectedSettled = order.amount - order.platformFee - order.tds - order.refund;
    let actualSettled = transfer ? transfer.amount : 0;

    let status = 'pending';
    let category = null;
    let context = '';

    // ========== 1. Missing Payout ==========
    if (!transfer) {
      status = 'exception';
      category = 'missing_payout';
      context = `No Route transfer found for order ${order.orderId}`;
    }
    // ========== 2. Duplicate Payout ==========
    else if (isDuplicate) {
      status = 'exception';
      category = 'duplicate_payout';
      context = `Found ${transfers.length} transfers for same order. Expected 1.`;
    }
    // ========== 3. Expired Hold ==========
    else if (transfer.onHold && transfer.onHoldUntil && transfer.onHoldUntil < Math.floor(Date.now() / 1000)) {
      status = 'exception';
      category = 'chargeback_hold';
      context = `Hold expired on ${new Date(transfer.onHoldUntil * 1000).toLocaleDateString()} but still marked active`;
      actualSettled = transfer.amount;
    }
    // ========== 4. Reversal Pending ==========
    else if (transfer.amountReversed > 0) {
      status = 'exception';
      category = 'reversal_pending';
      context = `₹${(transfer.amountReversed / 100).toFixed(2)} reversed from vendor account`;
      actualSettled = transfer.amount;
    }
    // ========== 5. Settlement Failed ==========
    else if (transfer.settlementStatus === 'failed') {
      status = 'exception';
      category = 'settlement_failed';
      context = transfer.errorDescription || 'Settlement failed with no error description';
      actualSettled = transfer.amount;
    }
    // ========== 6. Amount Mismatch ==========
    else if (Math.abs(expectedSettled - transfer.amount) > 1) {
      status = 'exception';
      category = 'amount_mismatch';
      context = `Expected ₹${(expectedSettled / 100).toFixed(2)} but transfer shows ₹${(transfer.amount / 100).toFixed(2)}`;
      actualSettled = transfer.amount;
    }
    // ========== 7. Clean Match ==========
    else {
      status = 'matched';
      matched++;
    }

    if (status === 'exception') {
      exceptions++;
    }

    // Save to Reconciliation table
    const recon = await prisma.reconciliation.create({
      data: {
        batchId,
        orderId: order.orderId,
        transferId: transfer?.transferId || null,
        customerPaid: order.amount,
        routeSplit: transfer?.amount || 0,
        platformFee: order.platformFee,
        tdsDeducted: order.tds,
        chargebackHold: transfer?.onHold ? (expectedSettled - actualSettled) : 0,
        refundAmount: order.refund,
        finalSettled: actualSettled,
        fee: transfer?.fee || 0,
        tax: transfer?.tax || 0,
        status,
        matchConfidence: status === 'matched' ? 1.0 : 0.0,
        discrepancyCategory: category,
      },
    });

    // If exception, create Exception record
    if (status === 'exception') {
      await prisma.exception.create({
        data: {
          reconciliationId: recon.id,
          category,
          description: context,
          aiExplanation: null, // Day 7-8 mein fill hoga
          confidenceScore: 0.0,
          amountDiscrepancy: Math.abs(expectedSettled - actualSettled),
          status: 'open',
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        reconciliationId: recon.id,
        action: status === 'matched' ? 'MATCHED' : 'EXCEPTION_DETECTED',
        actor: 'system',
        details: {
          orderId: order.orderId,
          category: category || null,
          expectedAmount: expectedSettled,
          actualAmount: actualSettled,
        },
      },
    });
  }

  return {
    batchId,
    total: orders.length,
    matched,
    exceptions,
    matchRate: ((matched / orders.length) * 100).toFixed(1),
  };
}

module.exports = { runReconciliation };