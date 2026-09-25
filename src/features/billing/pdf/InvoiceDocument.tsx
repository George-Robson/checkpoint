import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { PdfBrand } from '../../../lib/pdf/brand';
import { PDF_COLOR as COLOR } from '../../../lib/pdf/colors';
import type { Invoice, InvoiceLine, InvoiceStatus } from '../../../types/invoice';
import type { Tenant } from '../../../types/tenant';
import { PAYMENT_TERMS_DAYS, VAT_RATE } from '../constants/billing';
import { STATUTORY_INTEREST_RATE } from '../constants/creditControl';
import { COMPANY_DETAILS } from '../constants/companyDetails';
import { INVOICE_LINE_KIND_META, INVOICE_LINE_KIND_ORDER } from '../constants/invoiceLineKindMeta';
import { INVOICE_STATUS_META } from '../constants/invoiceStatusMeta';
import { formatPeriod } from '../utils/billingPeriod';
import { invoiceTotals, lineAmount } from '../utils/invoiceTotals';

const STATUS_COLORS: Record<InvoiceStatus, { text: string; background: string }> = {
  paid: { text: COLOR.emerald, background: COLOR.emeraldBg },
  due: { text: COLOR.amber, background: COLOR.amberBg },
  overdue: { text: COLOR.rose, background: COLOR.roseBg },
};

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 64, paddingHorizontal: 40, fontFamily: 'Helvetica', fontSize: 9, color: COLOR.slate900 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  muted: { color: COLOR.slate500 },
  supplier: { marginTop: 10, color: COLOR.slate500 },
  textLine: { marginTop: 2 },
  titleBlock: { alignItems: 'flex-end' },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  status: { marginTop: 6, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  meta: { marginTop: 28, flexDirection: 'row', justifyContent: 'space-between' },
  metaColumn: { width: '48%' },
  label: { fontSize: 7, color: COLOR.slate500, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  strong: { fontFamily: 'Helvetica-Bold' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  table: { marginTop: 28 },
  tableHeader: { flexDirection: 'row', backgroundColor: COLOR.slate50, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLOR.slate200, paddingVertical: 6, paddingHorizontal: 8 },
  section: { paddingTop: 10, paddingBottom: 4, paddingHorizontal: 8, fontFamily: 'Helvetica-Bold', color: COLOR.indigo, fontSize: 8 },
  row: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderColor: COLOR.slate100 },
  colDescription: { flex: 1, paddingRight: 8 },
  colQuantity: { width: 40, textAlign: 'right' },
  colUnit: { width: 70, textAlign: 'right' },
  colAmount: { width: 76, textAlign: 'right' },
  lineDetail: { marginTop: 1, fontSize: 7.5, color: COLOR.slate500 },
  totals: { marginTop: 16, marginLeft: 'auto', width: 220 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderColor: COLOR.slate900 },
  grandTotalText: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  paidNote: { marginTop: 6, textAlign: 'right', color: STATUS_COLORS.paid.text },
  payment: { marginTop: 28, padding: 12, borderWidth: 1, borderColor: COLOR.slate200, borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between' },
  paymentColumn: { width: '48%' },
  footer: { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: COLOR.slate500, borderTopWidth: 1, borderColor: COLOR.slate200, paddingTop: 8 },
});

/** Stacked lines of text (a newline inside one Text is spaced unevenly by the renderer). */
function TextLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <Text key={line} style={index > 0 ? styles.textLine : undefined}>
          {line}
        </Text>
      ))}
    </>
  );
}

function LineRow({ line }: { line: InvoiceLine }) {
  return (
    <View style={styles.row} wrap={false}>
      <View style={styles.colDescription}>
        <Text>{line.description}</Text>
        {line.detail && <Text style={styles.lineDetail}>{line.detail}</Text>}
      </View>
      <Text style={styles.colQuantity}>{line.quantity}</Text>
      <Text style={styles.colUnit}>{formatMoney(line.unitPrice)}</Text>
      <Text style={styles.colAmount}>{formatMoney(lineAmount(line))}</Text>
    </View>
  );
}

interface InvoiceDocumentProps {
  invoice: Invoice;
  tenant: Tenant;
  status: InvoiceStatus;
}

/** The Checkpoint-branded invoice, rendered to PDF in the browser. */
export function InvoiceDocument({ invoice, tenant, status }: InvoiceDocumentProps) {
  const totals = invoiceTotals(invoice);
  const statusColors = STATUS_COLORS[status];
  const details = [
    ['Invoice number', invoice.number],
    ['Billing period', formatPeriod(invoice.period)],
    ['Issue date', formatDate(invoice.issuedOn)],
    ['Due date', formatDate(invoice.dueOn)],
    ['Account', tenant.shortCode],
  ];

  return (
    <Document title={`${invoice.number} · ${tenant.name}`} author={COMPANY_DETAILS.name} subject={`Invoice for ${formatPeriod(invoice.period)}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <PdfBrand name={COMPANY_DETAILS.name} />
            <View style={styles.supplier}>
              <TextLines lines={[COMPANY_DETAILS.legalName, ...COMPANY_DETAILS.addressLines, COMPANY_DETAILS.email]} />
            </View>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={[styles.status, { color: statusColors.text, backgroundColor: statusColors.background }]}>
              {INVOICE_STATUS_META[status].label.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaColumn}>
            <Text style={styles.label}>Bill to</Text>
            <Text style={styles.strong}>{tenant.name}</Text>
            <View style={styles.textLine}>
              <TextLines lines={[`Attn: ${tenant.primaryContact}`, tenant.region, tenant.domain]} />
            </View>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.label}>Invoice details</Text>
            {details.map(([label, value]) => (
              <View key={label} style={styles.detailRow}>
                <Text style={styles.muted}>{label}</Text>
                <Text>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.colDescription, styles.label, { marginBottom: 0 }]}>Description</Text>
            <Text style={[styles.colQuantity, styles.label, { marginBottom: 0 }]}>Qty</Text>
            <Text style={[styles.colUnit, styles.label, { marginBottom: 0 }]}>Unit price</Text>
            <Text style={[styles.colAmount, styles.label, { marginBottom: 0 }]}>Amount</Text>
          </View>
          {INVOICE_LINE_KIND_ORDER.map((kind) => {
            const lines = invoice.lines.filter((line) => line.kind === kind);
            if (lines.length === 0) return null;
            return (
              <View key={kind}>
                {/* The heading travels with the first line so it's never stranded at the foot of a page. */}
                <View wrap={false}>
                  <Text style={styles.section}>{INVOICE_LINE_KIND_META[kind].label}</Text>
                  <LineRow line={lines[0]} />
                </View>
                {lines.slice(1).map((line) => (
                  <LineRow key={`${line.description}-${line.detail}`} line={line} />
                ))}
              </View>
            );
          })}
        </View>

        <View style={styles.totals} wrap={false}>
          <View style={styles.totalRow}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text>{formatMoney(totals.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.muted}>
              VAT at {VAT_RATE * 100}%{totals.vatable !== totals.subtotal ? ` on ${formatMoney(totals.vatable)}` : ''}
            </Text>
            <Text>{formatMoney(totals.vat)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalText}>{status === 'paid' ? 'Total' : 'Total due'}</Text>
            <Text style={styles.grandTotalText}>{formatMoney(totals.total)}</Text>
          </View>
          {invoice.paidOn && <Text style={styles.paidNote}>Paid in full on {formatDate(invoice.paidOn)}. Thank you.</Text>}
        </View>

        <View style={styles.payment} wrap={false}>
          <View style={styles.paymentColumn}>
            <Text style={styles.label}>How to pay</Text>
            <TextLines
              lines={[
                `Bank transfer to ${COMPANY_DETAILS.bank.accountName}`,
                `${COMPANY_DETAILS.bank.name} · Sort code ${COMPANY_DETAILS.bank.sortCode} · Account ${COMPANY_DETAILS.bank.accountNumber}`,
              ]}
            />
            <Text style={styles.textLine}>
              Reference: <Text style={styles.strong}>{invoice.number}</Text>
            </Text>
          </View>
          <View style={styles.paymentColumn}>
            <Text style={styles.label}>Terms</Text>
            <Text>
              Payment due within {PAYMENT_TERMS_DAYS} days of the issue date. Recurring charges are billed monthly in
              advance; hardware bought outright is billed on the invoice after it is ordered. Late payments accrue
              statutory interest at {STATUTORY_INTEREST_RATE}% a year plus fixed compensation under the Late Payment of
              Commercial Debts (Interest) Act 1998.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {COMPANY_DETAILS.legalName} · Company no. {COMPANY_DETAILS.companyNumber} · VAT no. {COMPANY_DETAILS.vatNumber}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${invoice.number} · Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
