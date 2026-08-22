const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: Generate Razorpay-style IDs
function generateId(prefix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUnixTimestamp(daysAgo = 0) {
  return Math.floor((Date.now() - daysAgo * 24 * 60 * 60 * 1000) / 1000);
}

// REAL account IDs from your live Route integration
const VENDORS = [
  { id: 'acc_TSVZXCgLfmnxW8', name: 'Vendor_A', type: 'physical' },
  { id: 'acc_aB3dE5fG7hI9jK', name: 'Vendor_B', type: 'digital' },
  { id: 'acc_LmNoPqRsTuVwXy', name: 'Vendor_C', type: 'service' },
  { id: 'acc_Z1a2B3c4D5e6F7', name: 'Vendor_D', type: 'physical' },
  { id: 'acc_G8h9I0jKlMnOpQ', name: 'Vendor_E', type: 'digital' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clean everything first
  await prisma.auditLog.deleteMany();
  await prisma.exception.deleteMany();
  await prisma.reconciliation.deleteMany();
  await prisma.routeTransfer.deleteMany();
  await prisma.order.deleteMany();

  const TOTAL = 60;
  const DISCREPANCY_COUNT = 6; // 10% = 6 records with issues
  const CLEAN_COUNT = TOTAL - DISCREPANCY_COUNT; // 90% = 54 clean

  // Pick random indices for discrepancies
  const discrepancyIndices = new Set();
  while (discrepancyIndices.size < DISCREPANCY_COUNT) {
    discrepancyIndices.add(Math.floor(Math.random() * TOTAL));
  }

  console.log(`Creating ${TOTAL} orders: ${CLEAN_COUNT} clean + ${DISCREPANCY_COUNT} with discrepancies`);

  // Step A: Create all orders
  const orders = [];
  for (let i = 0; i < TOTAL; i++) {
    const orderId = generateId('order_');
    const amountPaise = Math.floor(Math.random() * 450000 + 50000); // ₹500 to ₹5000
    const platformFee = Math.floor(amountPaise * 0.09); // 9%
    const tds = amountPaise > 300000 ? Math.floor(amountPaise * 0.01) : 0; // 1% if > ₹3L
    const refund = Math.random() < 0.05 ? Math.floor(amountPaise * 0.2) : 0;

    const order = await prisma.order.create({
      data: {
        orderId,
        amount: amountPaise,
        currency: 'INR',
        customerId: generateId('cust_'),
        platformFee,
        tds,
        refund,
        status: refund > 0 ? 'partially_refunded' : 'paid',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000),
      },
    });
    orders.push(order);
  }

  // Step B: Create transfers for each order
  for (let i = 0; i < TOTAL; i++) {
    const order = orders[i];
    const vendor = VENDORS[i % VENDORS.length];
    const hasDiscrepancy = discrepancyIndices.has(i);

    // Default: clean transfer
    let transferAmount = order.amount - order.platformFee - order.tds - order.refund;
    let amountReversed = 0;
    let onHold = false;
    let onHoldUntil = null;
    let settlementStatus = 'settled';
    let fee = Math.floor(transferAmount * 0.02);
    let tax = Math.floor(fee * 0.18);
    let errorDescription = null;
    let skipTransfer = false;

    if (hasDiscrepancy) {
      const type = i % 6; // 6 types of discrepancies
      switch (type) {
        case 0: // Amount mismatch
          transferAmount = transferAmount - 5000; // ₹50 less
          break;
        case 1: // Chargeback hold expired
          onHold = true;
          onHoldUntil = generateUnixTimestamp(-5); // expired 5 days ago
          settlementStatus = 'pending';
          break;
        case 2: // Duplicate payout (will create 2 transfers)
          transferAmount = order.amount - order.platformFee;
          break;
        case 3: // Missing payout
          skipTransfer = true;
          break;
        case 4: // Reversal pending
          amountReversed = Math.floor(transferAmount * 0.3);
          transferAmount = transferAmount - amountReversed;
          break;
        case 5: // Settlement failed
          settlementStatus = 'failed';
          errorDescription = 'Beneficiary account frozen by bank';
          fee = 0;
          tax = 0;
          break;
      }
    }

    if (!skipTransfer) {
      // Create primary transfer
      await prisma.routeTransfer.create({
        data: {
          transferId: generateId('trf_'),
          entity: 'transfer',
          source: order.orderId,
          recipient: vendor.id,
          amount: Math.max(0, transferAmount),
          currency: 'INR',
          amountReversed,
          onHold,
          onHoldUntil,
          recipientSettlementId: settlementStatus !== 'failed' ? generateId('setl_') : null,
          settlementStatus,
          fee,
          tax,
          notes: {
            vendor_name: vendor.name,
            order_type: vendor.type,
            vendor_id: `VENDOR_${1000 + i}`,
            is_discrepancy: hasDiscrepancy,
          },
          errorDescription,
          createdAt: generateUnixTimestamp(Math.floor(Math.random() * 30)),
        },
      });

      // Create duplicate for case 2
      if (hasDiscrepancy && (i % 6) === 2) {
        await prisma.routeTransfer.create({
          data: {
            transferId: generateId('trf_'),
            entity: 'transfer',
            source: order.orderId,
            recipient: VENDORS[(i + 1) % VENDORS.length].id,
            amount: Math.max(0, transferAmount),
            currency: 'INR',
            amountReversed: 0,
            onHold: false,
            recipientSettlementId: generateId('setl_'),
            settlementStatus: 'settled',
            fee: 236,
            tax: 42,
            notes: {
              vendor_name: VENDORS[(i + 1) % VENDORS.length].name,
              order_type: 'duplicate',
              vendor_id: 'VENDOR_DUPLICATE',
              is_discrepancy: true,
            },
            createdAt: generateUnixTimestamp(1),
          },
        });
      }
    }
  }

  // Summary
  const orderCount = await prisma.order.count();
  const transferCount = await prisma.routeTransfer.count();
  console.log(`✅ Done! Orders: ${orderCount}, Transfers: ${transferCount}`);
  console.log(`   Clean: ${CLEAN_COUNT}, Discrepancies: ${DISCREPANCY_COUNT}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });