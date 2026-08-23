import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const REQUIRED_ORDER_FIELDS = ['order_id', 'amount', 'platform_fee', 'tds', 'refund', 'customer_id'];
const REQUIRED_TRANSFER_FIELDS = ['transfer_id', 'source', 'recipient', 'amount', 'on_hold', 'on_hold_until', 'amount_reversed', 'settlement_status', 'fee', 'tax', 'error_description'];

export async function mapColumnsWithAI(sheetHeaders, sampleRows, targetFields) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: Object.fromEntries(
          targetFields.map((f) => [
            f,
            { type: SchemaType.STRING, description: `Exact column header from the sheet that matches "${f}", or empty string if none matches` },
          ])
        ),
      },
    },
  });

  const prompt = `You are mapping messy spreadsheet columns to a fixed schema.

SHEET COLUMN HEADERS (exact names, case-sensitive):
${JSON.stringify(sheetHeaders)}

SAMPLE DATA (first 3 rows, to understand what each column contains):
${JSON.stringify(sampleRows.slice(0, 3))}

TARGET FIELDS I need to map to:
${targetFields.join(', ')}

For each target field, return the EXACT matching column header from the sheet (copy it exactly, including case/spacing). 
If no column reasonably matches a target field, return an empty string for that field.
Use both the header name AND the sample data content to decide — e.g. a column named "Txn ID" containing "order_..." values maps to order_id.`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export { REQUIRED_ORDER_FIELDS, REQUIRED_TRANSFER_FIELDS };