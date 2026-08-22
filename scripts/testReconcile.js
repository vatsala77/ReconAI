const { runReconciliation } = require('../lib/reconcile');      // ✅ ../lib/ (src nahi)
const { prisma } = require('../lib/prisma');                      // ✅ ../lib/ (src nahi)

async function test() {
  console.log('🧪 Testing matching engine...\n');

  // Clean old reconciliations first
  await prisma.auditLog.deleteMany();
  await prisma.exception.deleteMany();
  await prisma.reconciliation.deleteMany();

  const result = await runReconciliation(`batch_${Date.now()}`);

  console.log('========== RESULT ==========');
  console.log(`Total Orders: ${result.total}`);
  console.log(`Matched: ${result.matched}`);
  console.log(`Exceptions: ${result.exceptions}`);
  console.log(`Match Rate: ${result.matchRate}%`);
  console.log('==========================\n');

  // Show exceptions
  const exceptions = await prisma.exception.findMany({
    include: { reconciliation: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Found ${exceptions.length} exceptions:\n`);
  exceptions.forEach((ex, i) => {
    console.log(`${i + 1}. [${ex.category.toUpperCase()}]`);
    console.log(`   Order: ${ex.reconciliation.orderId}`);
    console.log(`   Issue: ${ex.description}`);
    console.log(`   Amount: ₹${(ex.amountDiscrepancy / 100).toFixed(2)}`);
    console.log('');
  });

  await prisma.$disconnect();
}

test();