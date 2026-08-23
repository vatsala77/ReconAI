export function downloadReconciliationCSV(exceptions, metrics) {
  const headers = ['Order ID', 'Category', 'Confidence', 'Amount Discrepancy (₹)', 'AI Explanation'];

  const rows = exceptions.map((exc) => {
    const orderId = exc.reconciliation?.orderId || 'N/A';
    const category = exc.category || 'unknown';
    const confidence = ((exc.confidenceScore || 0) * 100).toFixed(0) + '%';
    const amount = (exc.amountDiscrepancy / 100).toFixed(2);
    // Escape quotes and commas in explanation text for valid CSV
    const explanation = `"${(exc.aiExplanation || '').replace(/"/g, '""')}"`;
    return [orderId, category, confidence, amount, explanation].join(',');
  });

  const summaryLines = [
    `ReconAI Report`,
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    `Total Orders: ${metrics.total}`,
    `Matched: ${metrics.matched}`,
    `Exceptions: ${metrics.exceptions}`,
    `Match Rate: ${metrics.matchRate}%`,
    `Amount at Risk: ₹${((metrics.amountAtRisk || 0) / 100).toFixed(2)}`,
    '',
  ];

  const csvContent = [...summaryLines, headers.join(','), ...rows].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reconai-report-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}