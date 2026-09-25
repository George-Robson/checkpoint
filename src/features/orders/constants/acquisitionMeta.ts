import type { Acquisition } from '../../../types/acquisition';

interface AcquisitionMeta {
  /** The choice, e.g. in the order form. */
  label: string;
  /** The resulting state of a device, e.g. in the fleet. */
  ownership: string;
}

export const ACQUISITION_ORDER: Acquisition[] = ['lease', 'purchase'];

export const ACQUISITION_META: Record<Acquisition, AcquisitionMeta> = {
  lease: { label: 'Lease', ownership: 'Leased' },
  purchase: { label: 'Buy outright', ownership: 'Owned' },
};
