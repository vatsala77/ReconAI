import OpenAI from 'openai';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const REQUIRED_ORDER_FIELDS = [
  'order_id', 'amount', 'platform_fee', 'tds', 'refund', 'customer_id',
  'seller_id', 'seller_type', 'pan_available',
];
const REQUIRED_TRANSFER_FIELDS = [
  'transfer_id',
  'source',
  'recipient',
  'amount',
  'on_hold',
  'on_hold_until',
  'amount_reversed',
  'settlement_status',
  'fee',
  'tax',
  'error_description',
];

const REQUIRED_BANK_FIELDS = [
  'utr',
  'transfer_id',
  'amount_credited',
  'credited_at',
  'status',
];

const REQUIRED_GST_FIELDS = [
  'vendor_gstin',
  'order_id',
  'tcs_reported',
  'filing_period',
  'filed_at',
  'status',
];

export async function mapColumnsWithAI(sheetHeaders, sampleRows, targetFields) {
  const prompt = `You are mapping messy spreadsheet columns to a fixed schema.

SHEET COLUMN HEADERS (exact names, case-sensitive):
${JSON.stringify(sheetHeaders)}

SAMPLE DATA (first 3 rows, to understand what each column contains):
${JSON.stringify(sampleRows.slice(0, 3))}

TARGET FIELDS I need to map to:
${targetFields.join(', ')}

For each target field, return the EXACT matching column header from the sheet.

Rules:
1. Copy the original spreadsheet header EXACTLY, including capitalization and spaces.
2. Use both the header name and sample data to determine the match.
3. If no reasonable match exists, return an empty string for that field.
4. Do not invent a spreadsheet column.
5. Return ONLY a JSON object with exactly these keys: ${targetFields.join(', ')}. No other text, no markdown formatting.

Example:
If the target field is "order_id" and the spreadsheet has a column "Order ID",
return:
{
  "order_id": "Order ID"
}`;

  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  const rawText = completion.choices[0].message.content;
  return JSON.parse(rawText);
}

export {
  REQUIRED_ORDER_FIELDS,
  REQUIRED_TRANSFER_FIELDS,
  REQUIRED_BANK_FIELDS,
  REQUIRED_GST_FIELDS,
};