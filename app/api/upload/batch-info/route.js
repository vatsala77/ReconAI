import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadBatchId = searchParams.get('uploadBatchId');

    if (!uploadBatchId) {
      return new Response(JSON.stringify({ error: 'uploadBatchId is required' }), { status: 400 });
    }

    const batch = await prisma.uploadBatch.findUnique({
      where: { id: uploadBatchId },
      select: { orderCount: true, fileName: true },
    });

    if (!batch) {
      return new Response(JSON.stringify({ error: 'Batch not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(batch), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}