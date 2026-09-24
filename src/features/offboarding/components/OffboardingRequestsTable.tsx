import { ClipboardList } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { OffboardingRequest } from '../../../types/offboarding';
import { OffboardingRequestRow } from './OffboardingRequestRow';

const HEADER_CELL = 'whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-slate-500 first:pl-4 last:pr-4';

interface OffboardingRequestsTableProps {
  requests: OffboardingRequest[];
  showTenant: boolean;
  highlightRequestId: string | null;
}

export function OffboardingRequestsTable({ requests, showTenant, highlightRequestId }: OffboardingRequestsTableProps) {
  const open = requests.filter((request) => request.status !== 'completed').length;

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Offboarding requests" description={`${open} open · ${requests.length} total`} />
      {requests.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No offboarding requests" description="Requests you create appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className={HEADER_CELL}>
                  Request
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Employee
                </th>
                {showTenant && (
                  <th scope="col" className={HEADER_CELL}>
                    Client
                  </th>
                )}
                <th scope="col" className={HEADER_CELL}>
                  Last working day
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Devices
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Status
                </th>
                <th scope="col" className={HEADER_CELL}>
                  Requested by
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <OffboardingRequestRow
                  key={request.id}
                  request={request}
                  showTenant={showTenant}
                  isNew={request.id === highlightRequestId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
