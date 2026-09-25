import { useMemo } from 'react';
import { CircleCheck, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { paths } from '../../app/paths';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { Card } from '../../components/ui/Card';
import { CardHeader } from '../../components/ui/CardHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatDate } from '../../lib/date';
import { useKits } from '../kits/hooks/useKits';
import { useOrders } from '../orders/hooks/useOrders';
import { useTenant } from '../tenants/hooks/useTenant';
import { useTenantScoped } from '../tenants/hooks/useTenantScoped';
import { OnboardingTable } from './components/OnboardingTable';
import { useOnboardings } from './hooks/useOnboardings';
import type { OnboardingCreatedState } from './types/onboardingCreatedState';

export function OnboardingPage() {
  const location = useLocation();
  const created = location.state as OnboardingCreatedState | null;
  const { selectedTenant, isGlobalView } = useTenant();
  const { onboardings } = useOnboardings();
  const scoped = useTenantScoped(onboardings);
  const { kits } = useKits();
  const kitById = useMemo(() => new Map(kits.map((kit) => [kit.id, kit])), [kits]);
  const { orders } = useOrders();
  const orderById = useMemo(() => new Map(orders.map((order) => [order.id, order])), [orders]);

  const upcoming = scoped.filter((onboarding) => onboarding.status !== 'completed');
  const recent = scoped.filter((onboarding) => onboarding.status === 'completed');
  const createdOnboarding = created ? onboardings.find((onboarding) => onboarding.id === created.createdId) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description={`New hires${selectedTenant ? ` at ${selectedTenant.name}` : ''}: hardware kit and software licences, ready on day one.`}
        actions={
          <Link to={paths.newOnboarding} className={buttonClasses('primary', 'md')}>
            <UserPlus aria-hidden="true" className="size-4" />
            Onboard a new hire
          </Link>
        }
      />

      {createdOnboarding && (
        <div role="status" className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <p className="text-emerald-900">
            <span className="font-medium">{createdOnboarding.reference}</span>: {createdOnboarding.person} starts{' '}
            {formatDate(createdOnboarding.startDate)}. {createdOnboarding.kitId ? 'Hardware ordered and ' : ''}
            {createdOnboarding.softwareIds.length} licences scheduled
            {created && created.seatsAdded > 0
              ? `; ${created.seatsAdded} ${created.seatsAdded === 1 ? 'seat was' : 'seats were'} added to full pools.`
              : '.'}
          </p>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader title="Upcoming" description={`${upcoming.length} new hires being prepared`} />
        <OnboardingTable
          onboardings={upcoming}
          kitById={kitById}
          orderById={orderById}
          showTenant={isGlobalView}
          highlightId={created?.createdId ?? null}
          empty={
            <EmptyState
              icon={UserPlus}
              title="No upcoming new hires"
              description="Start an onboarding to order their kit and assign licences."
            />
          }
        />
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Recently started" description="Onboardings whose start date has passed" />
        <OnboardingTable
          onboardings={recent}
          kitById={kitById}
          orderById={orderById}
          showTenant={isGlobalView}
          highlightId={null}
          empty={<EmptyState icon={UserPlus} title="Nobody has started recently" />}
        />
      </Card>
    </div>
  );
}
