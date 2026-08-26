import { prisma } from './prisma';

const TDS_STANDARD_RATE = 0.001; // 0.1% under Section 194-O
const TDS_PENAL_RATE = 0.05;     // 5% if PAN/Aadhaar not provided
const THRESHOLD_EXEMPT_AMOUNT = 500000 * 100; // ₹5 lakh in paise, per financial year
const GST_ON_FEE_RATE = 0.18;    // 18% GST on platform/Route fee
const TOLERANCE_PAISE = 100;     // ₹1 tolerance for rounding

function getFinancialYearRange(date) {
  const d = new Date(date);
  const year = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1; // FY starts April
  const start = new Date(`${year}-04-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-03-31T23:59:59.999Z`);
  return { start, end };
}

async function getCumulativeAnnualAmount(sellerId, orderDate) {
  const { start, end } = getFinancialYearRange(orderDate);
  const result = await prisma.order.aggregate({
    where: { sellerId, createdAt: { gte: start, lte: end } },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
}

async function verifyTDS(order) {
  const issues = [];
  const isIndividualOrHUF = order.sellerType === 'individual' || order.sellerType === 'huf';
  const panAvailable = order.panAvailable !== false;

  if (isIndividualOrHUF) {
    const cumulativeAnnualAmount = await getCumulativeAnnualAmount(order.sellerId, order.createdAt);
    if (cumulativeAnnualAmount <= THRESHOLD_EXEMPT_AMOUNT) {
      if (order.tds > TOLERANCE_PAISE) {
        issues.push({
          line: 'TDS',
          expected: 0,
          actual: order.tds,
          rule: `Section 194-O threshold exemption — seller ${order.sellerId} is individual/HUF with cumulative FY volume ₹${(cumulativeAnnualAmount / 100).toFixed(2)}, under the ₹5,00,000 exemption limit, so no TDS should apply`,
        });
      }
      return issues;
    }
  }

  const expectedRate = panAvailable ? TDS_STANDARD_RATE : TDS_PENAL_RATE;
  const expectedTDS = Math.round(order.amount * expectedRate);

  if (Math.abs(order.tds - expectedTDS) > TOLERANCE_PAISE) {
    const rateLabel = panAvailable ? '0.1% (standard)' : '5% (penal — no PAN/Aadhaar)';
    issues.push({
      line: 'TDS',
      expected: expectedTDS,
      actual: order.tds,
      rule: `Section 194-O — ${rateLabel} TDS on gross transaction value`,
    });
  }

  return issues;
}

function verifyGSTOnFee(transfer) {
  const issues = [];
  if (!transfer) return issues;

  const expectedGSTOnFee = Math.round(transfer.fee * GST_ON_FEE_RATE);
  if (Math.abs(transfer.tax - expectedGSTOnFee) > TOLERANCE_PAISE) {
    issues.push({
      line: 'GST on Platform Fee',
      expected: expectedGSTOnFee,
      actual: transfer.tax,
      rule: '18% GST applicable on platform commission/fee',
    });
  }

  return issues;
}

export async function verifyTaxLines(order, transfer) {
  const tdsIssues = await verifyTDS(order);
  const gstFeeIssues = verifyGSTOnFee(transfer);
  return [...tdsIssues, ...gstFeeIssues];
}