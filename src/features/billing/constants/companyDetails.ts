/**
 * Supplier details printed on every invoice.
 * Placeholders: replace with Checkpoint IT Group's registered details before real use.
 */
export const COMPANY_DETAILS = {
  name: 'Checkpoint IT Group',
  legalName: 'Checkpoint IT Group Ltd',
  addressLines: ['Registered office address', 'Town, Postcode', 'United Kingdom'],
  email: 'accounts@example.com',
  companyNumber: '00000000',
  vatNumber: 'GB 000 0000 00',
  bank: {
    name: 'Bank name',
    accountName: 'Checkpoint IT Group Ltd',
    sortCode: '00-00-00',
    accountNumber: '00000000',
  },
} as const;
