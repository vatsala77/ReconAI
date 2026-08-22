import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const total = await prisma.reconciliation.count();
    const matched = await prisma.reconciliation.count({ where: { status: 'matched' } });
    const exceptionsCount = await prisma.reconciliation.count({ where: { status: 'exception' } });
    const openExceptions = await prisma.exception.count({ where: { status: 'open' } });

    const amountAtRisk = await prisma.exception.aggregate({
      where: { status: 'open' },
      _sum: { amountDiscrepancy: true },
    });

    const latestBatch = await prisma.reconciliation.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { batchId: true, createdAt: true },
    });

    return new Response(
      JSON.stringify({
        total,
        matched,
        exceptions: exceptionsCount,
        openExceptions,
        amountAtRisk: amountAtRisk._sum.amountDiscrepancy || 0,
        matchRate: total > 0 ? ((matched / total) * 100).toFixed(1) : '0.0',
        latestBatch: latestBatch?.batchId || null,
        lastRun: latestBatch?.createdAt || null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}