import type { DeviceOffboardAction } from '../../../types/offboarding';

interface DeviceActionMeta {
  label: string;
  description: string;
}

export const DEVICE_ACTION_ORDER: DeviceOffboardAction[] = ['wipe-return', 'wipe-reassign', 'retain'];

export const DEVICE_ACTION_META: Record<DeviceOffboardAction, DeviceActionMeta> = {
  'wipe-return': {
    label: 'Wipe & return',
    description: 'Remote wipe, then collected and returned to Checkpoint stock.',
  },
  'wipe-reassign': {
    label: 'Wipe & reassign',
    description: 'Factory reset and kept on site as a spare for the next hire.',
  },
  retain: {
    label: 'No change',
    description: 'Left as-is, e.g. under legal hold.',
  },
};
