const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

/** e.g. 189 → "£189" */
export function formatCurrency(amount: number): string {
  return gbpFormatter.format(amount);
}
