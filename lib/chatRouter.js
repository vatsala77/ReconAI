export function classifyQuestion(question) {
  const q = question.toLowerCase();

  // Specific order lookup — e.g. "why did order_ABC123 fail?"
  const orderIdMatch = question.match(/order[_\s]?([A-Za-z0-9]{4,})/i);
  if (orderIdMatch) {
    return { type: 'specific_order', orderId: orderIdMatch[1] };
  }

  // Category/pattern breakdown — e.g. "which category has the most risk?"
  if (/categor|pattern|breakdown|type of (exception|issue)/i.test(q)) {
    return { type: 'category_breakdown' };
  }

  // Highest-risk / amount-based — e.g. "which exception has the highest amount at risk?"
  if (/highest|biggest|largest|most (amount|risk|money)/i.test(q)) {
    return { type: 'top_risk' };
  }

  // Summary/overview — e.g. "summarize this batch"
  if (/summar|overview|overall|how (is|did) (this|the) batch/i.test(q)) {
    return { type: 'summary' };
  }

  // Default — general question, needs broader context
  return { type: 'general' };
}