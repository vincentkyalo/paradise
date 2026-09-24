import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { BarClubPOS } from './components/pos/BarClubPOS';
import { ClubManagement } from './components/club/ClubManagement';
import { HotelManagement } from './components/hotel/HotelManagement';
import { ButcheryCounter } from './components/butchery/ButcheryCounter';
import { RestaurantKDS } from './components/restaurant/RestaurantKDS';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { CCTVMonitoring } from './components/cctv/CCTVMonitoring';
import { FinanceExpenses } from './components/finance/FinanceExpenses';
import { CustomerCRM } from './components/crm/CustomerCRM';
import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { SecurityIncidents } from './components/security/SecurityIncidents';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { SystemSettings } from './components/settings/SystemSettings';
import { ThermalReceiptModal } from './components/common/ThermalReceiptModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, canAccessView, toast, showToast } = useApp();

  const renderActiveView = () => {
    if (!canAccessView(currentView)) {
      return (
        <div className="p-8 max-w-lg mx-auto text-center space-y-4 my-16 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Access Restricted</h2>
          <p className="text-xs text-slate-400">
            Your current assigned role does not have authorization to access this operational module. Please switch roles using the top navigation bar or request clearance from the Super Administrator.
          </p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'pos':
        return <BarClubPOS />;
      case 'club':
        return <ClubManagement />;
      case 'hotel':
        return <HotelManagement />;
      case 'butchery':
        return <ButcheryCounter />;
      case 'restaurant':
        return <RestaurantKDS />;
      case 'inventory':
        return <InventoryManagement />;
      case 'cctv':
        return <CCTVMonitoring />;
      case 'finance':
        return <FinanceExpenses />;
      case 'crm':
        return <CustomerCRM />;
      case 'employees':
        return <EmployeeManagement />;
      case 'security':
        return <SecurityIncidents />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Universal App Header */}
      <Header />

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Department Navigation Sidebar */}
        <Sidebar />

        {/* Scrollable Main Operations Stage */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Thermal Receipt Modal */}
      <ThermalReceiptModal />

      {/* Global Action Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
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
