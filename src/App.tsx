import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { OnboardingModal } from './components/common/OnboardingModal';
import { AskAiModal } from './components/ai/AskAiModal';

// Views
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { AiManagerView } from './components/ai/AiManagerView';
import { AiActivityLogView } from './components/ai/AiActivityLogView';
import { PropertyKnowledgeView } from './components/ai/PropertyKnowledgeView';
import { PropertiesList } from './components/properties/PropertiesList';
import { ReservationsView } from './components/reservations/ReservationsView';
import { UnifiedCalendarView } from './components/calendar/UnifiedCalendarView';
import { GuestCrmView } from './components/crm/GuestCrmView';
import { UnifiedInboxView } from './components/inbox/UnifiedInboxView';
import { OperationsHubView } from './components/operations/OperationsHubView';
import { CleaningManagementView } from './components/operations/CleaningManagementView';
import { MaintenanceView } from './components/operations/MaintenanceView';
import { SocialMediaView } from './components/social/SocialMediaView';
import { ContentStudioView } from './components/social/ContentStudioView';
import { RevenuePricingView } from './components/revenue/RevenuePricingView';
import { FinancialDashboardView } from './components/finance/FinancialDashboardView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { IntegrationsView } from './components/integrations/IntegrationsView';

import { WorkspaceOnboarding } from './components/onboarding/WorkspaceOnboarding';
import { PropertyOnboarding } from './components/onboarding/PropertyOnboarding';
import { GuestPortalView } from './components/guest/GuestPortalView';

const MainLayout: React.FC = () => {
  const { activeTab, activeWorkspace, properties, workspaces, isPropertyOnboardingOpen, isWorkspaceOnboardingOpen, theme } = useApp();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isGuestPortalMode, setIsGuestPortalMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('guestPortal') === 'true';
    }
    return false;
  });

  // If directly opened in Guest Portal mode (e.g. from QR scan)
  if (isGuestPortalMode) {
    return (
      <GuestPortalView 
        onExitPreview={() => {
          setIsGuestPortalMode(false);
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', window.location.pathname);
          }
        }}
      />
    );
  }

  const hasPersonalWorkspace = (workspaces || []).some(w => !w.isDemo);

  // If workspace onboarding is open or no personal workspace and not in demo, show WorkspaceOnboarding
  if (isWorkspaceOnboardingOpen || (!hasPersonalWorkspace && !activeWorkspace?.isDemo)) {
    return <WorkspaceOnboarding />;
  }

  // If active workspace has no properties or property onboarding/edit modal is open, show Property Onboarding
  if ((activeWorkspace && !activeWorkspace.isDemo && properties.length === 0) || isPropertyOnboardingOpen) {
    return <PropertyOnboarding />;
  }

  const renderActiveView = () => {
    if (properties.length === 0 && !activeWorkspace?.isDemo) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7 7-7M19 10v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-serif">Your portfolio is empty</h2>
            <p className="text-stone-500 mt-2">Start by adding your first villa property to manage.</p>
          </div>
          <button 
            onClick={() => {/* Trigger Property Onboarding again if needed */}}
            className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-stone-800 transition-all flex items-center space-x-2"
          >
            <span>+ Add Your First Property</span>
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'aiManager':
        return <AiManagerView />;
      case 'properties':
        return <PropertiesList />;
      case 'reservations':
        return <ReservationsView />;
      case 'calendar':
        return <UnifiedCalendarView />;
      case 'crm':
      case 'guests' as any:
        return <GuestCrmView />;
      case 'inbox':
        return <UnifiedInboxView />;
      case 'operations':
        return <OperationsHubView />;
      case 'cleaning':
        return <CleaningManagementView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'socialMedia':
      case 'social':
      case 'contentStudio':
        return <SocialMediaView />;
      case 'revenue':
        return <RevenuePricingView />;
      case 'finance':
        return <FinancialDashboardView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'aiLogs':
        return <AiActivityLogView />;
      case 'propertyKnowledge':
      case 'settings' as any:
        return <PropertyKnowledgeView />;
      case 'guestPortal' as any:
        return <GuestPortalView />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className={`flex h-screen ${theme === 'night' ? 'bg-[#12110F] text-[#F4F2EE]' : 'bg-[#FAF9F6] text-[#2D2926]'} overflow-hidden antialiased font-sans transition-colors duration-200 selection:bg-[#FEFAE0] selection:text-[#606C38]`}>
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar header */}
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AskAiModal />
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
