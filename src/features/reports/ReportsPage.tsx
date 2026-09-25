import { useState } from 'react';
import { CircleAlert, Download, FileChartColumn, LoaderCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { FilterSelect, type FilterSelectOption } from '../../components/ui/FilterSelect';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePdfDownload } from '../../hooks/usePdfDownload';
import { formatDate, getNow, toIsoDate } from '../../lib/date';
import { useInvoices } from '../billing/hooks/useInvoices';
import { formatPeriod, periodOf, shiftPeriod } from '../billing/utils/billingPeriod';
import { useDevices } from '../devices/hooks/useDevices';
import { useTickets } from '../helpdesk/hooks/useTickets';
import { useLicences } from '../licences/hooks/useLicences';
import { useOffboarding } from '../offboarding/hooks/useOffboarding';
import { useOnboardings } from '../onboarding/hooks/useOnboardings';
import { useTenant } from '../tenants/hooks/useTenant';
import { ServiceReportView } from './components/ServiceReportView';
import { buildServiceReport } from './utils/buildServiceReport';

/** Months offered, newest first. */
const MONTHS_AVAILABLE = 4;

export function ReportsPage() {
  const { tenants, selectedTenant } = useTenant();
  const { tickets } = useTickets();
  const { devices } = useDevices();
  const { onboardings } = useOnboardings();
  const { requests } = useOffboarding();
  const { pools, assignments } = useLicences();
  const { invoices } = useInvoices();
  const pdf = usePdfDownload();

  const today = toIsoDate(getNow());
  const currentPeriod = periodOf(today);
  const periods = Array.from({ length: MONTHS_AVAILABLE }, (_, index) => shiftPeriod(currentPeriod, -index));
  // Default to the last complete month: that's the one a client would be sent.
  const [period, setPeriod] = useState(periods[1]);
  const [chosenTenantId, setChosenTenantId] = useState(tenants[0]?.id ?? '');
  const tenant = selectedTenant ?? tenants.find((candidate) => candidate.id === chosenTenantId);

  const report = tenant
    ? buildServiceReport(tenant, period, today, {
        tickets,
        devices,
        onboardings,
        offboardings: requests,
        pools,
        assignments,
        invoices,
      })
    : null;

  const periodOptions: FilterSelectOption<string>[] = periods.map((candidate) => ({
    value: candidate,
    label: `${formatPeriod(candidate)}${candidate === currentPeriod ? ' (to date)' : ''}`,
  }));
  const tenantOptions: FilterSelectOption<string>[] = tenants.map((candidate) => ({ value: candidate.id, label: candidate.name }));

  function downloadPdf() {
    if (!report) return;
    void pdf.download(report.tenant.id, `${report.tenant.shortCode}-service-report-${report.period}.pdf`, async () => {
      const { renderServiceReportPdf } = await import('./pdf/renderServiceReportPdf');
      return renderServiceReportPdf(report);
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service reports"
        description="A monthly summary for each client: support, device health, security, backups, what's coming up, and what we recommend."
        actions={
          <Button onClick={downloadPdf} disabled={!report || pdf.pendingKey !== null}>
            {pdf.pendingKey ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Download aria-hidden="true" className="size-4" />
            )}
            {pdf.pendingKey ? 'Generating…' : 'Download PDF'}
          </Button>
        }
      />

      {pdf.error && (
        <div role="alert" className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rose-600" />
          {pdf.error}
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          {!selectedTenant && (
            <FilterSelect label="Client" value={chosenTenantId} options={tenantOptions} onChange={setChosenTenantId} />
          )}
          <FilterSelect label="Month" value={period} options={periodOptions} onChange={setPeriod} />
          {report && (
            <p className="text-sm text-slate-500 sm:ml-auto">
              {report.tenant.name} · {report.tenant.plan} plan ·{' '}
              {report.partial ? `month to date, as at ${formatDate(report.asOf)}` : `${formatPeriod(report.period)}`}
            </p>
          )}
        </div>
      </Card>

      {report ? (
        <ServiceReportView report={report} />
      ) : (
        <Card>
          <EmptyState icon={FileChartColumn} title="Choose a client" description="Reports are per client." />
        </Card>
      )}
    </div>
  );
}
