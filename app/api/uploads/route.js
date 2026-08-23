import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return new Response(JSON.stringify({ error: 'companyId required' }), { status: 400 });
    }

    const uploads = await prisma.uploadBatch.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(uploads), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}