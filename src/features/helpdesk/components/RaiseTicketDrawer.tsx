import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Drawer';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { RadioGroup } from '../../../components/ui/RadioGroup';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import type { TicketCategory, TicketPriority } from '../../../types/ticket';
import { useAccountStanding } from '../../billing/hooks/useAccountStanding';
import { useDevices } from '../../devices/hooks/useDevices';
import { useSession } from '../../session/hooks/useSession';
import { useTenant } from '../../tenants/hooks/useTenant';
import { getTenant } from '../../tenants/utils/tenantLookup';
import { SLA_TARGETS } from '../constants/sla';
import { TICKET_CATEGORY_META, TICKET_CATEGORY_ORDER, TICKET_PRIORITY_META, TICKET_PRIORITY_ORDER } from '../constants/ticketMeta';
import { useTickets } from '../hooks/useTickets';
import type { Ticket } from '../../../types/ticket';
import { formatMinutes } from '../utils/ticketSla';

interface RaiseTicketDrawerProps {
  onClose: () => void;
  onRaised: (ticket: Ticket) => void;
}

/** Raise a support ticket for a client (clients raise their own; Checkpoint staff raise them on a client's behalf). */
export function RaiseTicketDrawer({ onClose, onRaised }: RaiseTicketDrawerProps) {
  const { currentUser } = useSession();
  const { tenants, selectedTenant } = useTenant();
  const { devices } = useDevices();
  const { raiseTicket } = useTickets();
  const [tenantId, setTenantId] = useState(currentUser.tenantId ?? selectedTenant?.id ?? '');
  const [requester, setRequester] = useState(currentUser.tenantId ? currentUser.name : '');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('software');
  const [priority, setPriority] = useState<TicketPriority>('p3');
  const [deviceId, setDeviceId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const tenant = tenantId ? getTenant(tenantId) : undefined;
  const standing = useAccountStanding(tenantId || null);
  // While services are suspended, only critical issues are handled (security and outages still matter).
  const suspended = standing?.stage === 'suspended';
  const allowedPriorities = suspended ? (['p1'] as TicketPriority[]) : TICKET_PRIORITY_ORDER;
  const effectivePriority = allowedPriorities.includes(priority) ? priority : allowedPriorities[0];
  const tenantDevices = devices.filter((device) => device.tenantId === tenantId);

  const errors = {
    tenantId: !tenantId ? 'Choose the client.' : undefined,
    requester: requester.trim().length < 2 ? 'Who is this for?' : undefined,
    subject: subject.trim().length < 4 ? 'Summarise the issue in a few words.' : undefined,
    description: description.trim().length < 10 ? 'Describe what’s happening.' : undefined,
  };
  const valid = Object.values(errors).every((error) => !error);

  function submit() {
    setSubmitted(true);
    if (!valid) return;
    const ticket = raiseTicket({
      tenantId,
      requester: requester.trim(),
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority: effectivePriority,
      source: currentUser.tenantId ? 'portal' : 'phone',
      deviceId: deviceId || null,
      alertId: null,
    });
    onRaised(ticket);
  }

  return (
    <Drawer
      title="Raise a ticket"
      description="The service desk picks it up straight away. Response and resolution targets depend on priority and the client’s plan."
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Raise ticket</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {!currentUser.tenantId && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Client" error={submitted ? errors.tenantId : undefined}>
              {(controlProps) => (
                <Select {...controlProps} value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
                  <option value="" disabled>
                    Select a client…
                  </option>
                  {tenants.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Requester" error={submitted ? errors.requester : undefined}>
              {(controlProps) => (
                <Input {...controlProps} value={requester} onChange={(event) => setRequester(event.target.value)} placeholder="Who called?" />
              )}
            </FormField>
          </div>
        )}

        {suspended && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-900">
            {tenant?.name}’s services are suspended for non-payment, so only critical (P1) issues can be raised.
          </p>
        )}

        <FormField label="Subject" error={submitted ? errors.subject : undefined}>
          {(controlProps) => (
            <Input
              {...controlProps}
              data-autofocus
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Outlook keeps asking for my password"
            />
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Category">
            {(controlProps) => (
              <Select {...controlProps} value={category} onChange={(event) => setCategory(event.target.value as TicketCategory)}>
                {TICKET_CATEGORY_ORDER.map((option) => (
                  <option key={option} value={option}>
                    {TICKET_CATEGORY_META[option].label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label="Device" optional>
            {(controlProps) => (
              <Select {...controlProps} value={deviceId} onChange={(event) => setDeviceId(event.target.value)} disabled={!tenantId}>
                <option value="">Not device-specific</option>
                {tenantDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} · {device.assignedUser ?? device.location}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>

        <RadioGroup
          name="ticket-priority"
          legend="Priority"
          value={effectivePriority}
          onChange={setPriority}
          options={allowedPriorities.map((option) => {
            const target = tenant ? SLA_TARGETS[tenant.plan][option] : null;
            return {
              value: option,
              label: TICKET_PRIORITY_META[option].label,
              description: (
                <>
                  {TICKET_PRIORITY_META[option].description}
                  {target &&
                    ` Response within ${formatMinutes(target.responseMinutes)}, resolution within ${formatMinutes(target.resolutionMinutes)}.`}
                </>
              ),
            };
          })}
        />

        <FormField label="Description" error={submitted ? errors.description : undefined}>
          {(controlProps) => (
            <Textarea
              {...controlProps}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What happened, when it started, and who’s affected"
            />
          )}
        </FormField>
      </div>
    </Drawer>
  );
}
