import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadBatchId = searchParams.get('uploadBatchId');

    let where = {};
    if (uploadBatchId) {
      where = {
        reconciliation: {
          uploadBatchId: uploadBatchId,
        },
      };
    }

    const exceptions = await prisma.exception.findMany({
      where,
      include: {
        reconciliation: {
          include: {
            order: true,
            transfer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(exceptions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Exception fetch error:', error);
    return new Response(JSON.stringify({ error: error.message, exceptions: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}