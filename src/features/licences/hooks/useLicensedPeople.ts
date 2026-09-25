import { useMemo } from 'react';
import { useDevices } from '../../devices/hooks/useDevices';
import { useTenantScoped } from '../../tenants/hooks/useTenantScoped';
import type { LicensedPerson } from '../types/licensedPerson';
import { useLicences } from './useLicences';

/** Everyone in scope who holds a licence or a device, so licences can be given to existing staff. */
export function useLicensedPeople(): LicensedPerson[] {
  const { assignments } = useLicences();
  const { devices } = useDevices();
  const scopedAssignments = useTenantScoped(assignments);
  const scopedDevices = useTenantScoped(devices);

  return useMemo(() => {
    const people = new Map<string, LicensedPerson>();

    function personFor(tenantId: string, name: string): LicensedPerson {
      const key = `${tenantId}:${name}`;
      let person = people.get(key);
      if (!person) {
        person = { key, name, tenantId, assignments: [], deviceCount: 0, startsOn: null, endsOn: null };
        people.set(key, person);
      }
      return person;
    }

    for (const assignment of scopedAssignments) personFor(assignment.tenantId, assignment.person).assignments.push(assignment);
    for (const device of scopedDevices) {
      if (device.assignedUser) personFor(device.tenantId, device.assignedUser).deviceCount += 1;
    }

    for (const person of people.values()) {
      person.endsOn = person.assignments.map((assignment) => assignment.endsOn ?? '').filter(Boolean).sort()[0] || null;
      const scheduled = person.assignments.filter((assignment) => assignment.status === 'scheduled');
      if (scheduled.length > 0 && scheduled.length === person.assignments.length) {
        person.startsOn = scheduled.map((assignment) => assignment.startsOn ?? '').sort()[0] || null;
      }
    }

    return [...people.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [scopedAssignments, scopedDevices]);
}
