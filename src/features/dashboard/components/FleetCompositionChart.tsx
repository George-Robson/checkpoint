import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, type BarShapeProps } from 'recharts';
import { ChartTooltip } from '../../../components/ui/ChartTooltip';
import { DEVICE_STATUS_META, DEVICE_STATUS_ORDER } from '../../../constants/deviceStatus';
import type { DeviceStatus } from '../../../types/device';
import { CHART_THEME } from '../constants/chartTheme';
import type { FleetCompositionRow } from '../types/fleetCompositionRow';

const ROW_HEIGHT = 64;
const BAR_THICKNESS = 20;
/** Surface-colored gap between stacked segments. */
const SEGMENT_GAP = 2;

/** Draws one stacked segment: gap on its right edge, or a rounded cap + total when it ends the bar. */
function renderSegment(status: DeviceStatus) {
  return function Segment(props: BarShapeProps) {
    const row = props.payload as FleetCompositionRow;
    const isBarEnd = row.lastSegment === status;
    const width = isBarEnd ? props.width : props.width - SEGMENT_GAP;

    if (width <= 0 || props.height <= 0) return <g />;

    return (
      <g>
        <Rectangle
          x={props.x}
          y={props.y}
          width={width}
          height={props.height}
          radius={isBarEnd ? [0, 4, 4, 0] : 0}
          fill={DEVICE_STATUS_META[status].chartColor}
        />
        {isBarEnd && (
          <text
            x={props.x + props.width + 8}
            y={props.y + props.height / 2}
            dominantBaseline="central"
            fontSize={12}
            fontWeight={500}
            fill={CHART_THEME.labelFill}
          >
            {row.total}
          </text>
        )}
      </g>
    );
  };
}

interface FleetCompositionChartProps {
  rows: FleetCompositionRow[];
}

export function FleetCompositionChart({ rows }: FleetCompositionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
        <XAxis type="number" hide domain={[0, 'dataMax']} />
        <YAxis
          type="category"
          dataKey="label"
          width={88}
          axisLine={false}
          tickLine={false}
          tick={CHART_THEME.axisTick}
        />
        <Tooltip
          cursor={{ fill: CHART_THEME.cursorFill }}
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as FleetCompositionRow | undefined;
            if (!active || !row) return null;
            return (
              <ChartTooltip
                title={row.label}
                rows={DEVICE_STATUS_ORDER.map((status) => ({
                  label: DEVICE_STATUS_META[status].label,
                  value: row.counts[status],
                  color: DEVICE_STATUS_META[status].chartColor,
                }))}
                footer={`${row.total} devices total`}
              />
            );
          }}
        />
        {DEVICE_STATUS_ORDER.map((status) => (
          <Bar
            key={status}
            name={DEVICE_STATUS_META[status].label}
            dataKey={(row: FleetCompositionRow) => row.counts[status]}
            stackId="status"
            barSize={BAR_THICKNESS}
            fill={DEVICE_STATUS_META[status].chartColor}
            shape={renderSegment(status)}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
