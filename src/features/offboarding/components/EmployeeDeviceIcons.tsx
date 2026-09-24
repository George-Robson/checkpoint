import { DEVICE_TYPE_META } from '../../../constants/deviceType';
import type { Device } from '../../../types/device';

interface EmployeeDeviceIconsProps {
  devices: Device[];
}

/** One icon chip per device, with the hostname on hover and for screen readers. */
export function EmployeeDeviceIcons({ devices }: EmployeeDeviceIconsProps) {
  return (
    <ul className="flex items-center gap-1">
      {devices.map((device) => {
        const { icon: Icon, label } = DEVICE_TYPE_META[device.type];
        return (
          <li
            key={device.id}
            title={`${device.name} · ${label}`}
            className="flex size-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500"
          >
            <Icon aria-hidden="true" className="size-3.5" />
            <span className="sr-only">
              {device.name} ({label})
            </span>
          </li>
        );
      })}
    </ul>
  );
}
