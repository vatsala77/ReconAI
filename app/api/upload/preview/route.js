import { mapColumnsWithAI, REQUIRED_ORDER_FIELDS, REQUIRED_TRANSFER_FIELDS, REQUIRED_BANK_FIELDS, REQUIRED_GST_FIELDS } from '@/lib/mapColumns';
import * as XLSX from 'xlsx';

function parseFileToRows(bytes) {
  const workbook = XLSX.read(bytes, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const mode = formData.get('mode') || 'single';

    let ordersRaw = [];
    let transfersRaw = [];
    let bankRaw = [];
    let gstRaw = [];
    let fileName = 'uploaded.xlsx';

    if (mode === 'single') {
      const file = formData.get('file');
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
      }

      fileName = file.name;
      const bytes = await file.arrayBuffer();
      const workbook = XLSX.read(bytes, { type: 'array' });
      const sheetNames = workbook.SheetNames;

      if (sheetNames.length < 2) {
        return new Response(
          JSON.stringify({ error: 'Excel file must have at least 2 sheets (Orders, Transfers)' }),
          { status: 400 }
        );
      }

      ordersRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
      transfersRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]]);

      if (sheetNames[2]) {
        bankRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[2]]);
      }
      if (sheetNames[3]) {
        gstRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[3]]);
      }
    } else {
      // mode === 'separate'
      const ordersFile = formData.get('ordersFile');
      const transfersFile = formData.get('transfersFile');
      const bankFile = formData.get('bankFile');
      const gstFile = formData.get('gstFile');

      if (!ordersFile || !transfersFile) {
        return new Response(
          JSON.stringify({ error: 'Orders and Transfers files are required' }),
          { status: 400 }
        );
      }

      fileName = ordersFile.name;
      ordersRaw = parseFileToRows(await ordersFile.arrayBuffer());
      transfersRaw = parseFileToRows(await transfersFile.arrayBuffer());

      if (bankFile) {
        bankRaw = parseFileToRows(await bankFile.arrayBuffer());
      }
      if (gstFile) {
        gstRaw = parseFileToRows(await gstFile.arrayBuffer());
      }
    }

    if (ordersRaw.length === 0 || transfersRaw.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Orders and Transfers data must contain rows' }),
        { status: 400 }
      );
    }

    const orderHeaders = Object.keys(ordersRaw[0]);
    const transferHeaders = Object.keys(transfersRaw[0]);
    const bankHeaders = bankRaw.length > 0 ? Object.keys(bankRaw[0]) : [];
    const gstHeaders = gstRaw.length > 0 ? Object.keys(gstRaw[0]) : [];

    const orderMapping = await mapColumnsWithAI(orderHeaders, ordersRaw, REQUIRED_ORDER_FIELDS);
    const transferMapping = await mapColumnsWithAI(transferHeaders, transfersRaw, REQUIRED_TRANSFER_FIELDS);

    let bankMapping = {};
    let gstMapping = {};

    if (bankRaw.length > 0) {
      bankMapping = await mapColumnsWithAI(bankHeaders, bankRaw, REQUIRED_BANK_FIELDS);
    }
    if (gstRaw.length > 0) {
      gstMapping = await mapColumnsWithAI(gstHeaders, gstRaw, REQUIRED_GST_FIELDS);
    }

    return new Response(
      JSON.stringify({
        orderHeaders,
        transferHeaders,
        bankHeaders,
        gstHeaders,
        orderMapping,
        transferMapping,
        bankMapping,
        gstMapping,
        ordersRaw,
        transfersRaw,
        bankRaw,
        gstRaw,
        fileName,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Preview error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}