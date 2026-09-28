/**
 * Currency and Date formatters for Fire & Safety Service Management
 */

// Formats number into Bahrain Dinar with exactly 3 decimal places (e.g., BHD 250.000)
export function formatBHD(amount) {
  if (amount === null || amount === undefined || amount === '' || isNaN(amount)) {
    return null;
  }
  const num = Number(amount);
  return 'BHD ' + num.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
}

// Parses string or number to clean 3-decimal float
export function parseBHD(amountStr) {
  if (!amountStr) return 0;
  const cleaned = String(amountStr).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 1000) / 1000;
}

// Format short date (e.g. 28 Sep 2026)
export function formatShortDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
