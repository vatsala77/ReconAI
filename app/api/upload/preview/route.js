import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { mapColumnsWithAI, REQUIRED_ORDER_FIELDS, REQUIRED_TRANSFER_FIELDS } from '@/lib/mapColumns';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    if (sheetNames.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Excel file must have at least 2 sheets' }),
        { status: 400 }
      );
    }

    const ordersRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    const transfersRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]]);

    if (ordersRaw.length === 0 || transfersRaw.length === 0) {
      return new Response(JSON.stringify({ error: 'Both sheets must contain data rows' }), { status: 400 });
    }

    const orderHeaders = Object.keys(ordersRaw[0]);
    const transferHeaders = Object.keys(transfersRaw[0]);

    const orderMapping = await mapColumnsWithAI(orderHeaders, ordersRaw, REQUIRED_ORDER_FIELDS);
    const transferMapping = await mapColumnsWithAI(transferHeaders, transfersRaw, REQUIRED_TRANSFER_FIELDS);

    return new Response(
      JSON.stringify({
        orderHeaders,
        transferHeaders,
        orderMapping,
        transferMapping,
        ordersRaw,
        transfersRaw,
        fileName: file.name,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Preview error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}