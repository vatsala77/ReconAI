const { ragStore } = require('./rag');
const OpenAI = require('openai');

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const VALID_CATEGORIES = [
  'tds_mismatch', 'chargeback_hold', 'platform_fee', 'duplicate_payout',
  'missing_payout', 'reversal_pending', 'settlement_failed', 'unknown',
  'bank_credit_delayed', 'bank_amount_mismatch', 'gst_tcs_mismatch',
  'tax_line_discrepancy', 'amount_mismatch',
];

async function callOpenRouter(prompt) {
  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0].message.content);

  const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'unknown';
  const confidence = typeof parsed.confidence === 'number'
    ? Math.max(0, Math.min(1, parsed.confidence))
    : 0.5;

  return {
    explanation: String(parsed.explanation || ''),
    category,
    confidence,
    amountDiscrepancy: Math.round(Number(parsed.amountDiscrepancy) || 0),
  };
}

async function explainDiscrepancy(data) {
  const searchQuery = `${data.category} ${data.context || ''}`.trim();

  let relevantRule = 'No specific regulatory document matched for this category.';
  try {
    const relevantDocs = await ragStore.query(searchQuery, 1);
    relevantRule = relevantDocs[0]?.text || relevantRule;
  } catch (ragError) {
    console.error('⚠️ RAG lookup failed, continuing without regulatory context:', ragError.message);
  }

  const prompt = `You are a senior financial reconciliation expert for Indian marketplaces using Razorpay Route.
Analyze the following transaction data points against the provided regulatory rule chunk to isolate why the settled amount deviates from mathematical expectations.

RELEVANT REGULATION MATCHED VIA RAG:
${relevantRule}

TRANSACTION DATA POINTS (All raw amounts passed are in Paise):
- Order ID: ${data.orderId}
- Customer Paid: ₹${(data.customerPaid / 100).toFixed(2)}
- Route Transfer Amount: ₹${(data.routeSplit / 100).toFixed(2)}
- Platform Fee: ₹${(data.platformFee / 100).toFixed(2)}
- TDS Deducted: ₹${(data.tdsDeducted / 100).toFixed(2)}
- Chargeback Hold: ₹${(data.chargebackHold / 100).toFixed(2)}
- Refund Processed: ₹${(data.refundAmount / 100).toFixed(2)}
- Route Fee: ₹${(data.fee / 100).toFixed(2)}
- Tax on Fee: ₹${(data.tax / 100).toFixed(2)}
- Final Settled: ₹${(data.finalSettled / 100).toFixed(2)}
- On Hold: ${data.onHold ? 'YES' : 'NO'}
- Hold Until: ${data.onHoldUntil ? new Date(data.onHoldUntil * 1000).toLocaleDateString() : 'N/A'}
- Amount Reversed: ₹${(data.amountReversed / 100).toFixed(2)}
- Settlement Status: ${data.settlementStatus}
- Error Description: ${data.errorDescription || 'None'}

DETECTED ISSUE CATEGORY: ${data.category}
ADDITIONAL RECONCILIATION CONTEXT: ${data.context}

EXPLANATION REQUIREMENTS:
- Provide a brief, concise, highly specific explanation.
- You must name the exact transaction metrics, specific mismatch amounts in Indian Rupees (₹), and directly cite the matched legal section or framework if applicable.
- Use explicit Indian marketplace terms (e.g., Section 194-O TDS, Section 52 CGST TCS, Route transfer hold, Chargeback arbitration window, UTR settlement).

Respond ONLY with a JSON object with exactly these keys: explanation (string), category (one of: ${VALID_CATEGORIES.join(', ')}), confidence (number 0.0–1.0), amountDiscrepancy (integer, in paise). No markdown, no preamble.`;

  try {
    return await callOpenRouter(prompt);
  } catch (error) {
    console.error('❌ AI explainer failed, retrying once:', error.message);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return await callOpenRouter(prompt);
    } catch (retryError) {
      console.error('❌ Retry also failed:', retryError.message);
      const computationalVariance = Math.abs((data.customerPaid || 0) - (data.finalSettled || 0));
      return {
        explanation: `System notice: Automating raw structural discrepancy review of ₹${(computationalVariance / 100).toFixed(2)} due to system handler failure. Context: ${data.context || 'None'}`,
        category: data.category || 'unknown',
        confidence: 0.0,
        amountDiscrepancy: computationalVariance,
      };
    }
  }
}

module.exports = { explainDiscrepancy };