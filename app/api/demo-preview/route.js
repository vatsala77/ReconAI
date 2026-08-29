import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'reconai_full_demo_batch_50plus.xlsx');
    const fileBuffer = await readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    const sheetNames = workbook.SheetNames;
    const preview = {};

    for (const name of sheetNames) {
      const allRows = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
      preview[name] = {
        totalRows: allRows.length,
        columns: allRows.length > 0 ? Object.keys(allRows[0]) : [],
        rows: allRows.slice(0, 8),
      };
    }

    return NextResponse.json(preview);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
