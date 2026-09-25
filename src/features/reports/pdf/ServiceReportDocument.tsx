import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { formatCurrency, formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/date';
import { PdfBrand } from '../../../lib/pdf/brand';
import { PDF_COLOR as COLOR } from '../../../lib/pdf/colors';
import { COMPANY_DETAILS } from '../../billing/constants/companyDetails';
import { formatPeriod } from '../../billing/utils/billingPeriod';
import { CYBER_ESSENTIALS_LABEL, DMARC_META } from '../../health/constants/healthMeta';
import { TICKET_CATEGORY_META } from '../../helpdesk/constants/ticketMeta';
import type { ServiceReport } from '../types/serviceReport';
import { formatResponse, formatShare } from '../utils/reportFormat';

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 60, paddingHorizontal: 40, fontFamily: 'Helvetica', fontSize: 9, color: COLOR.slate900 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleBlock: { alignItems: 'flex-end' },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  subtitle: { marginTop: 3, color: COLOR.slate500 },
  kpis: { marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: COLOR.slate200, borderRadius: 6 },
  kpi: { width: '33.33%', padding: 10, borderColor: COLOR.slate100 },
  kpiLabel: { fontSize: 7.5, color: COLOR.slate500 },
  kpiValue: { marginTop: 3, fontSize: 15, fontFamily: 'Helvetica-Bold' },
  kpiDetail: { marginTop: 2, fontSize: 7.5, color: COLOR.slate500 },
  columns: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: '48.5%' },
  section: { marginBottom: 14 },
  heading: { fontSize: 7, color: COLOR.indigo, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 1, borderColor: COLOR.slate100 },
  muted: { color: COLOR.slate500 },
  item: { paddingVertical: 2.5 },
  small: { fontSize: 7.5, color: COLOR.slate500 },
  recommendations: { marginTop: 4, padding: 12, backgroundColor: COLOR.slate50, borderRadius: 6 },
  recommendation: { flexDirection: 'row', marginTop: 4 },
  number: { width: 14, color: COLOR.indigo, fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 26, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: COLOR.slate500, borderTopWidth: 1, borderColor: COLOR.slate200, paddingTop: 8 },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

/** The client-facing monthly service report, branded as Checkpoint IT Group. */
export function ServiceReportDocument({ report }: { report: ServiceReport }) {
  const { tenant, support, health, backups, security, fleet, licences, billing } = report;
  const month = formatPeriod(report.period);
  const kpis = [
    { label: 'Tickets resolved', value: `${support.resolved}`, detail: `${support.raised} raised · ${support.openAtEnd} open` },
    { label: 'Resolved within SLA', value: formatShare(support.slaMet), detail: `${tenant.plan} plan targets` },
    { label: 'Average first response', value: formatResponse(support.averageFirstResponseMinutes), detail: 'Across tickets raised' },
    { label: 'Healthy devices', value: `${health.healthy} / ${health.monitored}`, detail: `Current, as at ${formatDate(report.snapshotOn)}` },
    { label: 'Patch compliance', value: formatShare(health.patchCompliance), detail: 'Devices fully up to date' },
    { label: 'Backup success', value: formatShare(backups.successRate), detail: `${backups.jobs} backup jobs` },
  ];

  return (
    <Document title={`${tenant.name} service report · ${month}`} author={COMPANY_DETAILS.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <PdfBrand name={COMPANY_DETAILS.name} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Service report</Text>
            <Text style={styles.subtitle}>
              {tenant.name} · {month}
              {report.partial ? ' (month to date)' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.kpis}>
          {kpis.map((kpi, index) => (
            <View key={kpi.label} style={[styles.kpi, { borderRightWidth: index % 3 < 2 ? 1 : 0, borderBottomWidth: index < 3 ? 1 : 0 }]}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiDetail}>{kpi.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.heading}>Support</Text>
              {support.byCategory.map((entry) => (
                <Row key={entry.category} label={TICKET_CATEGORY_META[entry.category].label} value={`${entry.count}`} />
              ))}
              {support.majorIncidents.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.small}>High-priority tickets</Text>
                  {support.majorIncidents.map((incident) => (
                    <Text key={incident.reference} style={styles.item}>
                      {incident.priority} · {incident.subject} ({incident.outcome.toLowerCase()})
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.heading}>Security</Text>
              {security && (
                <>
                  <Row label="MFA coverage" value={`${security.mfaEnrolled} / ${security.mfaTotal} users`} />
                  {security.secureScore !== null && <Row label="Microsoft Secure Score" value={`${security.secureScore}%`} />}
                  <Row
                    label="Cyber Essentials"
                    value={
                      security.cyberEssentials
                        ? `${CYBER_ESSENTIALS_LABEL[security.cyberEssentials.level]} to ${formatDate(security.cyberEssentials.expiresOn)}`
                        : 'Not certified'
                    }
                  />
                  <Row label="Email protection (DMARC)" value={DMARC_META[security.dmarc].label} />
                </>
              )}
              <Row label="Computers protected" value={`${health.protectedComputers} / ${health.agentComputers}`} />
            </View>

            {report.studioChecks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.heading}>Publisher security readiness</Text>
                {report.studioChecks.map((check) => (
                  <Row key={check.label} label={check.label} value={check.ok ? 'In place' : 'Gap'} />
                ))}
              </View>
            )}
          </View>

          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.heading}>Devices & people</Text>
              <Row label="Devices under management" value={`${fleet.devices}`} />
              <Row label="Added this month" value={`${fleet.added}`} />
              <Row label="Joiners" value={fleet.joiners.join(', ') || 'None'} />
              <Row label="Leavers" value={fleet.leavers.join(', ') || 'None'} />
              {fleet.upcomingRefreshes.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.small}>Due for refresh</Text>
                  {fleet.upcomingRefreshes.map((device) => (
                    <Text key={device.name} style={styles.item}>
                      {device.name} ({device.user}) · {device.owned ? 'warranty' : 'lease'} ends {formatDate(device.endsOn)}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.heading}>Licences & billing</Text>
              <Row label="Seats in use" value={`${licences.used} / ${licences.seats}`} />
              <Row label="Unused seat cost" value={`${formatCurrency(licences.idleCost)}/mo`} />
              {billing && <Row label={`Invoice ${billing.invoiceNumber}`} value={`${formatMoney(billing.total)} · ${billing.status}`} />}
            </View>

            {(health.needingAttention.length > 0 || backups.issues.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.heading}>Needs attention now</Text>
                {health.needingAttention.map((device) => (
                  <Text key={device.name} style={styles.item}>
                    {device.name}: {device.reasons.join(', ')}
                  </Text>
                ))}
                {backups.issues.map((issue) => (
                  <Text key={issue.name} style={styles.item}>
                    Backup {issue.name}: {issue.message}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {report.recommendations.length > 0 && (
          <View style={styles.recommendations} wrap={false}>
            <Text style={styles.heading}>Our recommendations</Text>
            {report.recommendations.map((recommendation, index) => (
              <View key={recommendation} style={styles.recommendation}>
                <Text style={styles.number}>{index + 1}.</Text>
                <Text style={{ flex: 1 }}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>
            Prepared by {COMPANY_DETAILS.name} for {tenant.primaryContact}, {tenant.name}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
