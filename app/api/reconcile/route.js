import { runReconciliation } from '@/lib/reconcile';

export async function POST() {
  try {
    const batchId = `batch_${Date.now()}`;
    const result = await runReconciliation(batchId);
    return new Response(JSON.stringify(result), {
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

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'ReconAI Reconcile API',
      usage: 'Send POST request to run reconciliation',
      method: 'POST',
      body: '{}',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}