import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const batch = await prisma.uploadBatch.findUnique({
      where: { id: params.batchId },
      select: { companyId: true },
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