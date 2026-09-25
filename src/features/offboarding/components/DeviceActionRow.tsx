import { Select } from '../../../components/ui/Select';
import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import { getNow } from '../../../lib/date';
import { daysUntilTermEnd } from '../../../lib/deviceTerm';
import type { Device } from '../../../types/device';
import type { DeviceOffboardAction } from '../../../types/offboarding';
import { DEVICE_ACTION_META, DEVICE_ACTION_ORDER } from '../constants/deviceActionMeta';

interface DeviceActionRowProps {
  device: Device;
  action: DeviceOffboardAction;
  onChange: (action: DeviceOffboardAction) => void;
}

function describeTerm(device: Device, daysRemaining: number): string {
  const term = device.acquisition === 'purchase' ? 'Owned · warranty' : 'Lease';
  if (daysRemaining < 0) return `${term} ended`;
  if (daysRemaining < 60) return `${term} ends in ${daysRemaining}d`;
  return `${term} ends in ${Math.round(daysRemaining / 30)} months`;
}

export function DeviceActionRow({ device, action, onChange }: DeviceActionRowProps) {
  const { icon: Icon } = DEVICE_TYPE_META[device.type];
  const daysRemaining = daysUntilTermEnd(device, getNow());

  return (
    <li className="flex items-center gap-3 px-3 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{device.name}</p>
        <p className="truncate text-xs text-slate-500">
          {device.model} · {describeTerm(device, daysRemaining)}
        </p>
      </div>
      <div className="w-40 shrink-0">
        <Select
          aria-label={`Action for ${device.name}`}
          value={action}
          onChange={(event) => onChange(event.target.value as DeviceOffboardAction)}
        >
          {DEVICE_ACTION_ORDER.map((option) => (
            <option key={option} value={option}>
              {DEVICE_ACTION_META[option].label}
            </option>
          ))}
        </Select>
      </div>
    </li>
  );
}
