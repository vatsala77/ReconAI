import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadBatchId = searchParams.get('uploadBatchId');

    const exceptions = await prisma.exception.findMany({
      where: uploadBatchId ? { reconciliation: { uploadBatchId } } : {},
      include: {
        reconciliation: { include: { order: true, transfer: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(exceptions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}