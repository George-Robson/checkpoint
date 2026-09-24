import { useState } from 'react';
import { MonitorSmartphone } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { CardHeader } from '../../../components/ui/CardHeader';
import { ChartLegend } from '../../../components/ui/ChartLegend';
import { EmptyState } from '../../../components/ui/EmptyState';
import { DEVICE_STATUS_META, DEVICE_STATUS_ORDER } from '../../../constants/deviceStatus';
import { cn } from '../../../lib/cn';
import { useFleetComposition } from '../hooks/useFleetComposition';
import type { ChartView } from '../types/chartView';
import { ChartViewToggle } from './ChartViewToggle';
import { FleetCompositionChart } from './FleetCompositionChart';
import { FleetCompositionTable } from './FleetCompositionTable';

const LEGEND_ITEMS = DEVICE_STATUS_ORDER.map((status) => ({
  label: DEVICE_STATUS_META[status].label,
  color: DEVICE_STATUS_META[status].chartColor,
}));

interface FleetCompositionPanelProps {
  className?: string;
}

export function FleetCompositionPanel({ className }: FleetCompositionPanelProps) {
  const rows = useFleetComposition();
  const [view, setView] = useState<ChartView>('chart');
  const totalDevices = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        title="Fleet by category"
        description={`${totalDevices} managed devices by status`}
        actions={totalDevices > 0 && <ChartViewToggle value={view} onChange={setView} />}
      />
      {totalDevices === 0 ? (
        <EmptyState icon={MonitorSmartphone} title="No devices yet" description="Devices appear here once enrolled." />
      ) : (
        <div className="flex-1 p-4">
          {view === 'chart' ? (
            <>
              <ChartLegend items={LEGEND_ITEMS} />
              <div className="mt-4">
                <FleetCompositionChart rows={rows} />
              </div>
            </>
          ) : (
            <FleetCompositionTable rows={rows} />
          )}
        </div>
      )}
    </Card>
  );
}
