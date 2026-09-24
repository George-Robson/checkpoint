import type { DeviceType } from '../../../types/device';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';

interface DeviceTypeCellProps {
  type: DeviceType;
}

export function DeviceTypeCell({ type }: DeviceTypeCellProps) {
  const { label, icon: Icon } = DEVICE_TYPE_META[type];
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-slate-700">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
      {label}
    </span>
  );
}
