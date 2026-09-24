import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from 'recharts';
import { ChartTooltip } from '../../../components/ui/ChartTooltip';
import { CHART_THEME } from '../constants/chartTheme';
import type { LeaseExpiryBucket } from '../types/leaseExpiryBucket';

const CHART_HEIGHT = 272;
const MAX_BAR_WIDTH = 24;
const TOOLTIP_DEVICE_LIMIT = 3;

/** Emphasis form: months inside the refresh window in indigo, later months recede to slate. */
function LeaseColumn(props: BarShapeProps) {
  const bucket = props.payload as LeaseExpiryBucket;
  if (props.height <= 0) return <g />;

  return (
    <g>
      <Rectangle
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        radius={[4, 4, 0, 0]}
        fill={bucket.inRefreshWindow ? CHART_THEME.emphasisFill : CHART_THEME.contextFill}
      />
      {bucket.inRefreshWindow && (
        <text
          x={props.x + props.width / 2}
          y={props.y - 6}
          textAnchor="middle"
          fontSize={12}
          fontWeight={500}
          fill={CHART_THEME.labelFill}
        >
          {bucket.count}
        </text>
      )}
    </g>
  );
}

function describeDevices(bucket: LeaseExpiryBucket): string | undefined {
  if (bucket.count === 0) return undefined;
  const names = bucket.devices.slice(0, TOOLTIP_DEVICE_LIMIT).map((device) => device.name);
  const remainder = bucket.count - names.length;
  return remainder > 0 ? `${names.join(', ')} +${remainder} more` : names.join(', ');
}

interface LeaseExpiryChartProps {
  buckets: LeaseExpiryBucket[];
}

export function LeaseExpiryChart({ buckets }: LeaseExpiryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart data={buckets} margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART_THEME.gridStroke} />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          minTickGap={4}
          tick={CHART_THEME.axisTick}
        />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={28} tick={CHART_THEME.axisTick} />
        <Tooltip
          cursor={{ fill: CHART_THEME.cursorFill }}
          content={({ active, payload }) => {
            const bucket = payload?.[0]?.payload as LeaseExpiryBucket | undefined;
            if (!active || !bucket) return null;
            return (
              <ChartTooltip
                title={bucket.longLabel}
                rows={[
                  {
                    label: bucket.inRefreshWindow ? 'Within refresh window' : 'Leases ending',
                    value: bucket.count,
                    color: bucket.inRefreshWindow ? CHART_THEME.emphasisFill : CHART_THEME.contextFill,
                  },
                ]}
                footer={describeDevices(bucket)}
              />
            );
          }}
        />
        <Bar dataKey="count" maxBarSize={MAX_BAR_WIDTH} shape={LeaseColumn} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
