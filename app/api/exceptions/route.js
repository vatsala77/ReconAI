import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const exceptions = await prisma.exception.findMany({
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}