const { ragStore } = require('./rag');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          explanation: {
            type: SchemaType.STRING,
            description: 'A highly clear summary detailing the precise breakdown metrics, variance values in Rupees, and corresponding regulatory rule citation.',
          },
          category: {
            type: SchemaType.STRING,
            enum: ['tds_mismatch', 'chargeback_hold', 'platform_fee', 'duplicate_payout', 'missing_payout', 'reversal_pending', 'settlement_failed', 'unknown'],
          },
          confidence: {
            type: SchemaType.NUMBER,
            description: 'Confidence scoring matching data constraints between 0.0 and 1.0',
          },
          amountDiscrepancy: {
            type: SchemaType.INTEGER,
            description: 'The calculated discrepancy margin or unaligned transaction variance calculated in absolute Paise.',
          },
        },
        required: ['explanation', 'category', 'confidence', 'amountDiscrepancy'],
      },
    },
  });
}

async function callGemini(prompt) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());
  return {
    explanation: parsed.explanation,
    category: parsed.category,
    confidence: parsed.confidence,
    amountDiscrepancy: parsed.amountDiscrepancy,
  };
}

async function explainDiscrepancy(data) {
  const searchQuery = `${data.category} ${data.context || ''}`.trim();
  const relevantDocs = await ragStore.query(searchQuery, 1);
  const relevantRule = relevantDocs[0]?.text || 'No specific regulatory document matched for this category.';

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
- Use explicit Indian marketplace terms (e.g., Section 194-O TDS, Section 52 CGST TCS, Route transfer hold, Chargeback arbitration window).

Respond ONLY with a JSON object matching the required schema. No markdown, no preamble.`;

  try {
    return await callGemini(prompt);
  } catch (error) {
    console.error('❌ AI explainer failed, retrying once:', error.message);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return await callGemini(prompt);
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