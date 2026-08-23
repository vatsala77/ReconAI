import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadBatchId = searchParams.get('uploadBatchId');
    const where = uploadBatchId ? { uploadBatchId } : {};

    const total = await prisma.reconciliation.count({ where });
    const matched = await prisma.reconciliation.count({ where: { ...where, status: 'matched' } });
    const exceptionsCount = await prisma.reconciliation.count({ where: { ...where, status: 'exception' } });

    const reconIds = (await prisma.reconciliation.findMany({ where, select: { id: true } })).map((r) => r.id);
    const openExceptions = await prisma.exception.count({
      where: { status: 'open', reconciliationId: { in: reconIds } },
    });
    const amountAtRisk = await prisma.exception.aggregate({
      where: { status: 'open', reconciliationId: { in: reconIds } },
      _sum: { amountDiscrepancy: true },
    });

    const latestBatch = await prisma.reconciliation.findFirst({
      where,
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}