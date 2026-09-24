import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { ChartLegend } from '../../../components/ui/ChartLegend';
import { LEASE_TERM_MONTHS, REFRESH_WINDOW_DAYS } from '../../../data/mockData';
import { cn } from '../../../lib/cn';
import { CHART_THEME } from '../constants/chartTheme';
import { useLeaseExpiryTimeline } from '../hooks/useLeaseExpiryTimeline';
import type { ChartView } from '../types/chartView';
import { ChartViewToggle } from './ChartViewToggle';
import { LeaseExpiryChart } from './LeaseExpiryChart';
import { LeaseExpiryTable } from './LeaseExpiryTable';

const LEGEND_ITEMS = [
  { label: `Within ${REFRESH_WINDOW_DAYS} days`, color: CHART_THEME.emphasisFill },
  { label: 'Later', color: CHART_THEME.contextFill },
];

interface LeaseExpiryPanelProps {
  className?: string;
}

export function LeaseExpiryPanel({ className }: LeaseExpiryPanelProps) {
  const buckets = useLeaseExpiryTimeline();
  const [view, setView] = useState<ChartView>('chart');
  const totalEnding = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        title="Lease expiries"
        description={`${totalEnding} ${LEASE_TERM_MONTHS}-month leases end in the next 12 months`}
        actions={<ChartViewToggle value={view} onChange={setView} />}
      />
      <div className="flex-1 p-4">
        {view === 'chart' ? (
          <>
            <ChartLegend items={LEGEND_ITEMS} />
            <div className="mt-4">
              <LeaseExpiryChart buckets={buckets} />
            </div>
          </>
        ) : (
          <LeaseExpiryTable buckets={buckets} />
        )}
      </div>
    </Card>
  );
}
