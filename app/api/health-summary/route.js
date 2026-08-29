import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadBatchId = searchParams.get('uploadBatchId');

    if (!uploadBatchId) {
      return NextResponse.json({ error: 'uploadBatchId is required' }, { status: 400 });
    }

    const reconciliations = await prisma.reconciliation.findMany({
      where: { uploadBatchId },
      include: { exceptions: true },
    });

    const total = reconciliations.length;
    const matched = reconciliations.filter((r) => r.status === 'matched').length;
    const resolved = reconciliations.filter((r) => r.status === 'resolved').length;
    const openExceptions = reconciliations.filter((r) => r.status === 'exception');

    const categoryCounts = {};
    for (const r of openExceptions) {
      const cat = r.discrepancyCategory || 'unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    const totalAmountAtRisk = openExceptions.reduce((sum, r) => {
      const exc = r.exceptions[0];
      return sum + (exc?.amountDiscrepancy || 0);
    }, 0);

    if (total === 0) {
      return NextResponse.json({ summary: 'No records to summarize yet.' });
    }

    const prompt = `You are a finance-ops assistant summarizing a reconciliation batch. Write a concise 2-sentence health summary (max 45 words total) for a dashboard card. Be specific and factual — no generic filler.

BATCH STATS:
- Total orders: ${total}
- Matched cleanly: ${matched}
- Resolved (reviewed by human): ${resolved}
- Open exceptions: ${openExceptions.length}
- Exception categories: ${JSON.stringify(categoryCounts)}
- Total amount at risk: ₹${(totalAmountAtRisk / 100).toFixed(2)}

Mention the dominant exception category by name and the amount at risk. If resolved > 0, mention that some exceptions were reviewed/resolved. Respond with plain text only, no markdown, no preamble.`;

    let summary;
    try {
      const completion = await openrouter.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 120,
      });
      summary = completion.choices[0].message.content.trim();
    } catch (err) {
      console.error('Health summary generation failed:', err.message);
      const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
      summary = `${matched + resolved} of ${total} orders settled cleanly. ${openExceptions.length} open exceptions${topCategory ? `, mostly ${topCategory[0].replace(/_/g, ' ')}` : ''}, totaling ₹${(totalAmountAtRisk / 100).toFixed(2)} at risk.`;
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
