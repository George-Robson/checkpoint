import { Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FleetPage } from '../features/fleet/FleetPage';
import { KitBuilderPage } from '../features/kits/KitBuilderPage';
import { LicencesPage } from '../features/licences/LicencesPage';
import { KitsPage } from '../features/kits/KitsPage';
import { OffboardingPage } from '../features/offboarding/OffboardingPage';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { OnboardingWizardPage } from '../features/onboarding/OnboardingWizardPage';
import { StorefrontPage } from '../features/provisioning/StorefrontPage';
import { NotFoundPage } from './NotFoundPage';
import { paths } from './paths';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path={paths.fleet} element={<FleetPage />} />
        <Route path={paths.onboarding} element={<OnboardingPage />} />
        <Route path={paths.newOnboarding} element={<OnboardingWizardPage />} />
        <Route path={paths.storefront} element={<StorefrontPage />} />
        <Route path={paths.software} element={<LicencesPage />} />
        <Route path={paths.offboarding} element={<OffboardingPage />} />
        <Route path={paths.kits} element={<KitsPage />} />
        <Route path={paths.newKit} element={<KitBuilderPage />} />
        <Route path={`${paths.kits}/:kitId`} element={<KitBuilderPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
