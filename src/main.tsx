import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { InvoicesProvider } from './features/billing/context/InvoicesProvider';
import { ClockProvider } from './features/clock/context/ClockProvider';
import { TicketsProvider } from './features/helpdesk/context/TicketsProvider';
import { DevicesProvider } from './features/devices/context/DevicesProvider';
import { KitsProvider } from './features/kits/context/KitsProvider';
import { LicencesProvider } from './features/licences/context/LicencesProvider';
import { OffboardingProvider } from './features/offboarding/context/OffboardingProvider';
import { OnboardingsProvider } from './features/onboarding/context/OnboardingsProvider';
import { OrdersProvider } from './features/orders/context/OrdersProvider';
import { SessionProvider } from './features/session/context/SessionProvider';
import { TenantProvider } from './features/tenants/context/TenantProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <TenantProvider>
          <DevicesProvider>
            <KitsProvider>
              <OrdersProvider>
                <LicencesProvider>
                  <OnboardingsProvider>
                    <OffboardingProvider>
                      <InvoicesProvider>
                        <TicketsProvider>
                          <ClockProvider>
                            <App />
                          </ClockProvider>
                        </TicketsProvider>
                      </InvoicesProvider>
                    </OffboardingProvider>
                  </OnboardingsProvider>
                </LicencesProvider>
              </OrdersProvider>
            </KitsProvider>
          </DevicesProvider>
        </TenantProvider>
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
