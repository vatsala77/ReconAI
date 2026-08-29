import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORY_LABELS = {
  missing_payout: 'Missing Payout',
  duplicate_payout: 'Duplicate Payout',
  chargeback_hold: 'Hold Expired',
  reversal_pending: 'Reversal Pending',
  settlement_failed: 'Settlement Failed',
  amount_mismatch: 'Amount Mismatch',
  bank_credit_delayed: 'Bank Delay',
  bank_amount_mismatch: 'Bank Mismatch',
  gst_tcs_mismatch: 'GST TCS Mismatch',
  tax_line_discrepancy: 'Tax Line Discrepancy',
};

export function generatePDF(exceptions, metrics, auditLogs = []) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 20;

  // ── Header ──
  doc.setFillColor(7, 18, 42);
  doc.rect(0, 0, pageWidth, 52, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ReconAI', margin, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Route Settlement Reconciliation Report', margin, 28);

  doc.setFontSize(9);
  doc.text('Generated: ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }), margin, 36);

  doc.setFontSize(9);
  doc.text('CONFIDENTIAL', pageWidth - margin - 25, 18);

  y = 60;

  // ── Summary Section ──
  doc.setTextColor(7, 18, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, y);
  y += 8;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const totalOrders = metrics?.total || 0;
  const matchedOrders = metrics?.matched || 0;
  const matchRate = Number(metrics?.matchRate) || 0;
  const totalExceptions = exceptions.length;
  const openExceptions = exceptions.filter((e) => e.status !== 'resolved').length;
  const resolvedExceptions = totalExceptions - openExceptions;
  const totalDiscrepancy = exceptions.reduce((sum, e) => sum + (e.amountDiscrepancy || 0), 0);

  const summaryData = [
    ['Total Orders Processed', totalOrders.toLocaleString('en-IN')],
    ['Matched Orders', matchedOrders.toLocaleString('en-IN')],
    ['Match Rate', matchRate.toFixed(1) + '%'],
    ['Total Exceptions', totalExceptions.toString()],
    ['Open Exceptions', openExceptions.toString()],
    ['Resolved Exceptions', resolvedExceptions.toString()],
    ['Total Discrepancy', '\u20B9' + (totalDiscrepancy / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { halign: 'right', cellWidth: 50 },
    },
    margin: { left: margin, right: margin },
  });

  y = doc.lastAutoTable.finalY + 12;

  // ── Exception Categories Breakdown ──
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Exception Categories', margin, y);
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  const catMap = {};
  exceptions.forEach((exc) => {
    const cat = exc.category || 'unknown';
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const catData = Object.entries(catMap)
    .map(([key, count]) => [CATEGORY_LABELS[key] || key, count.toString(), ((count / totalExceptions) * 100).toFixed(1) + '%'])
    .sort((a, b) => parseInt(b[1]) - parseInt(a[1]));

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Count', '% of Total']],
    body: catData,
    theme: 'striped',
    headStyles: { fillColor: [7, 18, 42], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: margin, right: margin },
  });

  y = doc.lastAutoTable.finalY + 12;

  // ── Exception Details Table ──
  if (y > 220) { doc.addPage(); y = 20; }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Exception Details', margin, y);
  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  const excRows = exceptions.map((exc) => {
    const orderId = exc.reconciliation?.orderId || '-';
    const category = CATEGORY_LABELS[exc.category] || exc.category || '-';
    const discrepancy = '\u20B9' + ((exc.amountDiscrepancy || 0) / 100).toLocaleString('en-IN');
    const status = exc.status === 'resolved' ? (exc.resolutionAction || 'Resolved') : 'Open';
    const explanation = (exc.aiExplanation || '').substring(0, 80) + ((exc.aiExplanation || '').length > 80 ? '...' : '');
    return [orderId, category, discrepancy, status, explanation];
  });

  autoTable(doc, {
    startY: y,
    head: [['Order ID', 'Category', 'Amount', 'Status', 'AI Explanation']],
    body: excRows,
    theme: 'striped',
    headStyles: { fillColor: [7, 18, 42], fontSize: 7 },
    styles: { fontSize: 7, cellPadding: 2.5, overflow: 'ellipsize' },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 20 },
      4: { cellWidth: 78 },
    },
    margin: { left: margin, right: margin },
  });

  y = doc.lastAutoTable.finalY + 12;

  // ── Audit Trail ──
  if (auditLogs.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Audit Trail', margin, y);
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    const auditRows = auditLogs.slice(0, 30).map((log) => {
      const action = log.action || '-';
      const actor = log.actor || 'system';
      const time = log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : '-';
      const details = typeof log.details === 'object' ? JSON.stringify(log.details).substring(0, 60) : String(log.details || '-').substring(0, 60);
      return [action, actor, time, details];
    });

    autoTable(doc, {
      startY: y,
      head: [['Action', 'Actor', 'Timestamp', 'Details']],
      body: auditRows,
      theme: 'striped',
      headStyles: { fillColor: [7, 18, 42], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 2.5, overflow: 'ellipsize' },
      margin: { left: margin, right: margin },
    });
  }

  // ── Footer ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'ReconAI Compliance Report | Page ' + i + ' of ' + totalPages + ' | Generated ' + new Date().toLocaleDateString('en-IN'),
      margin,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text('CONFIDENTIAL', pageWidth - margin - 25, doc.internal.pageSize.getHeight() - 8);
  }

  // Download
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save('ReconAI-Report-' + dateStr + '.pdf');
}
