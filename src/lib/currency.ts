const wholePounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const withPence = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });

/** e.g. 189 → "£189", 4.9 → "£4.90", 1760 → "£1,760" */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? wholePounds.format(rounded) : withPence.format(rounded);
}

/** Always two decimal places, for invoices: e.g. 189 → "£189.00". */
export function formatMoney(amount: number): string {
  return withPence.format(Math.round(amount * 100) / 100);
}
