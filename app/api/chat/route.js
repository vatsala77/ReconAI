import { prisma } from '@/lib/prisma';
import Groq from 'groq-sdk';
import { ragStore } from '@/lib/rag';
import { classifyQuestion } from '@/lib/chatRouter';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { uploadBatchId, question, history = [] } = await request.json();

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), { status: 400 });
    }

    const where = uploadBatchId ? { uploadBatchId } : {};
    const classification = classifyQuestion(question);

    let contextBlock = '';

    if (classification.type === 'specific_order') {
      const recon = await prisma.reconciliation.findFirst({
        where: { ...where, orderId: { contains: classification.orderId } },
        include: { exceptions: true },
      });

      if (!recon) {
        contextBlock = `No order matching "${classification.orderId}" was found in this batch.`;
      } else {
        contextBlock = `ORDER DETAIL:\n${JSON.stringify({
          orderId: recon.orderId,
          status: recon.status,
          category: recon.discrepancyCategory,
          customerPaid: recon.customerPaid,
          finalSettled: recon.finalSettled,
          explanation: recon.exceptions[0]?.aiExplanation || 'No exception — this order matched cleanly.',
          amountDiscrepancy: recon.exceptions[0]?.amountDiscrepancy || 0,
          taxLineBreakdown: recon.exceptions[0]?.taxLineBreakdown || null,
        })}`;
      }
    } else if (classification.type === 'category_breakdown') {
      const grouped = await prisma.reconciliation.groupBy({
        by: ['discrepancyCategory'],
        where: { ...where, status: 'exception' },
        _count: true,
      });
      contextBlock = `EXCEPTION CATEGORY BREAKDOWN:\n${JSON.stringify(grouped)}`;
    } else if (classification.type === 'top_risk') {
      const topExceptions = await prisma.exception.findMany({
        where: { reconciliation: where },
        orderBy: { amountDiscrepancy: 'desc' },
        take: 5,
        include: { reconciliation: { select: { orderId: true } } },
      });
      contextBlock = `TOP 5 HIGHEST-RISK EXCEPTIONS:\n${JSON.stringify(
        topExceptions.map((e) => ({
          orderId: e.reconciliation.orderId,
          category: e.category,
          amountDiscrepancy: e.amountDiscrepancy,
          explanation: e.aiExplanation,
        }))
      )}`;
    } else {
      const reconciliations = await prisma.reconciliation.findMany({ where, include: { exceptions: true } });
      const total = reconciliations.length;
      const matched = reconciliations.filter((r) => r.status === 'matched').length;
      const exceptions = reconciliations.filter((r) => r.status === 'exception');
      const exceptionSummary = exceptions.map((r) => ({
        orderId: r.orderId,
        category: r.discrepancyCategory,
        amountDiscrepancy: r.exceptions[0]?.amountDiscrepancy || 0,
      }));
      contextBlock = `BATCH SUMMARY: Total ${total}, Matched ${matched}, Exceptions ${exceptions.length}\n\nEXCEPTIONS:\n${JSON.stringify(exceptionSummary)}`;
    }

    const needsRAG = /tds|gst|tax|section|regulation|rule|chargeback|compliance|utr|bank/i.test(question);
    const relevantRules = needsRAG
      ? (await ragStore.query(question, 1)).map((d) => d.text).join('\n\n')
      : '';

    const prompt = `You are ReconAI's assistant for a reconciliation batch. You can answer general questions naturally, but when the question is about this batch's data, orders, exceptions, or reconciliation, you must ONLY use the data provided below — never invent numbers or order details.

${contextBlock}

${relevantRules ? `RELEVANT REGULATION: ${relevantRules}` : ''}

HISTORY: ${history.slice(-4).map((h) => `${h.role}: ${h.content}`).join('\n')}

QUESTION: ${question}

Instructions:
- If the question is about this batch (orders, exceptions, amounts, reconciliation, tax rules), answer strictly from the data/regulation above. Be concise (2-3 sentences), cite order IDs/amounts where relevant.
- If the question is general/unrelated to the batch (e.g. basic math, greetings, general knowledge), just answer it directly and naturally — don't force it into the batch context.`;

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer = completion.choices[0].message.content;

    return new Response(JSON.stringify({ answer, routedAs: classification.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}