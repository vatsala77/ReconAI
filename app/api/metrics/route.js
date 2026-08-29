import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadBatchId = searchParams.get('uploadBatchId');
    const where = uploadBatchId ? { uploadBatchId } : {};

    const total = await prisma.reconciliation.count({ where });

    // 'resolved' counts as matched — the discrepancy was reviewed and handled by a human
    const matched = await prisma.reconciliation.count({
      where: { ...where, status: { in: ['matched', 'resolved'] } },
    });

    // Only genuinely still-open exceptions count against the exception total
    const exceptionsCount = await prisma.reconciliation.count({
      where: { ...where, status: 'exception' },
    });

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
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Metrics fetch error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        total: 0,
        matched: 0,
        exceptions: 0,
        openExceptions: 0,
        amountAtRisk: 0,
        matchRate: '0.0',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}