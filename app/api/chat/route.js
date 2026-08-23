import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ragStore } from '@/lib/rag';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { uploadBatchId, question, history = [] } = await request.json();

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), { status: 400 });
    }

    // Pull this batch's exceptions + summary stats as context
    const where = uploadBatchId ? { uploadBatchId } : {};
    const reconciliations = await prisma.reconciliation.findMany({
      where,
      include: { exceptions: true },
    });

    const total = reconciliations.length;
    const matched = reconciliations.filter((r) => r.status === 'matched').length;
    const exceptions = reconciliations.filter((r) => r.status === 'exception');

    const exceptionSummary = exceptions.map((r) => ({
      orderId: r.orderId,
      category: r.discrepancyCategory,
      customerPaid: r.customerPaid,
      finalSettled: r.finalSettled,
      explanation: r.exceptions[0]?.aiExplanation || 'No explanation generated yet',
      amountDiscrepancy: r.exceptions[0]?.amountDiscrepancy || 0,
    }));

    // Pull relevant regulation context via RAG based on the question
    const relevantDocs = await ragStore.query(question, 2);
    const relevantRules = relevantDocs.map((d) => d.text).join('\n\n');

    const prompt = `You are ReconAI's assistant, embedded in a reconciliation dashboard. Answer the user's question using ONLY the data below. Be concise, specific, cite exact amounts and order IDs where relevant. If the question can't be answered from this data, say so honestly.

BATCH SUMMARY:
- Total orders: ${total}
- Matched: ${matched}
- Exceptions: ${exceptions.length}

EXCEPTIONS DATA (JSON):
${JSON.stringify(exceptionSummary, null, 2)}

RELEVANT REGULATIONS (if applicable to the question):
${relevantRules}

CONVERSATION HISTORY:
${history.map((h) => `${h.role}: ${h.content}`).join('\n')}

USER QUESTION: ${question}

Answer in 2-4 sentences, plain language, no markdown headers.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', generationConfig: { temperature: 0.3 } });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}