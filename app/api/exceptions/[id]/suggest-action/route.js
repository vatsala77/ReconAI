import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function POST(req, { params }) {
  const { id } = await params;

  const exception = await prisma.exception.findUnique({
    where: { id },
    include: { reconciliation: { include: { order: true, transfer: true } } },
  });

  if (!exception) {
    return NextResponse.json({ error: 'Exception not found' }, { status: 404 });
  }

  const recon = exception.reconciliation;

  const prompt = `You are a financial-ops assistant for an Indian marketplace using Razorpay Route. Recommend ONE concrete, actionable resolution step for the following reconciliation exception. Do not explain the problem again — only recommend the fix.

EXCEPTION CATEGORY: ${exception.category}
DESCRIPTION: ${exception.description}
AMOUNT DISCREPANCY: ₹${(exception.amountDiscrepancy / 100).toFixed(2)}
ORDER ID: ${recon.orderId}

Respond ONLY with a JSON object with exactly these keys:
- "suggestedAction": a short imperative action (max 12 words), e.g. "Re-verify TDS deduction with seller's PAN status"
- "reasoning": 1-2 sentences explaining why this action resolves the specific discrepancy, referencing the exact amounts/category above

No markdown, no preamble.`;

  try {
    const completion = await openrouter.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json({
      suggestedAction: parsed.suggestedAction || 'Manual review required',
      reasoning: parsed.reasoning || '',
    });
  } catch (err) {
    console.error('Suggest-action failed:', err.message);
    return NextResponse.json({
      suggestedAction: 'Manual review required',
      reasoning: 'AI suggestion service unavailable — please review this exception manually.',
    });
  }
}