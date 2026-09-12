import React, { useState, useEffect } from 'react';
import { AppContextProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { POSView } from './components/pos/POSView';
import { ProductsView } from './components/inventory/ProductsView';
import { KardexView } from './components/kardex/KardexView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { CreditsView } from './components/credits/CreditsView';
import { CashView } from './components/cash/CashView';
import { ContactsView } from './components/contacts/ContactsView';
import { FiscalView } from './components/fiscal/FiscalView';
import { ReportsView } from './components/reports/ReportsView';
import { HardwareView } from './components/hardware/HardwareView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { SwaggerView } from './components/swagger/SwaggerView';
import { ReadmeView } from './components/docs/ReadmeView';
import { HardwareScannerModal } from './components/common/HardwareScannerModal';
import { DigitalScaleModal } from './components/common/DigitalScaleModal';
import {
  Zap,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  Wallet,
  Users2,
  FileCheck2,
  FileBarChart,
  Scale,
  ShieldCheck,
  Settings,
  Code2,
  BookOpen,
  Menu,
  X,
  Barcode,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { theme, hasPermission } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);

  // Keyboard shortcut listener (e.g. F2 for POS, F4 for Inventory, F8 for Scale, F9 for Scanner)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setIsScaleModalOpen(prev => !prev);
      } else if (e.key === 'F9') {
        e.preventDefault();
        setIsScannerModalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'pos':
        return <POSView />;
      case 'inventory':
        return <ProductsView />;
      case 'kardex':
        return <KardexView />;
      case 'purchases':
        return <PurchasesView />;
      case 'credits':
        return <CreditsView />;
      case 'cash':
        return <CashView />;
      case 'contacts':
        return <ContactsView />;
      case 'fiscal':
        return <FiscalView />;
      case 'reports':
        return <ReportsView />;
      case 'hardware':
        return <HardwareView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'swagger':
        return <SwaggerView />;
      case 'readme':
        return <ReadmeView />;
      default:
        return <POSView />;
    }
  };

  const mobileNavItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'pos', label: 'POS Venta', icon: Zap },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'kardex', label: 'Kardex', icon: Boxes },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'credits', label: 'Créditos', icon: CreditCard },
    { id: 'cash', label: 'Caja Chica', icon: Wallet },
    { id: 'contacts', label: 'Clientes', icon: Users2 },
    { id: 'fiscal', label: 'DGI Fiscal', icon: FileCheck2 },
    { id: 'reports', label: 'Reportes', icon: FileBarChart },
    { id: 'hardware', label: 'Hardware', icon: Scale },
    { id: 'users', label: 'Usuarios', icon: ShieldCheck },
    { id: 'settings', label: 'Config BD', icon: Settings },
    { id: 'swagger', label: 'API Swagger', icon: Code2 },
    { id: 'readme', label: 'Docs', icon: BookOpen },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar
        onNavigateToReports={() => setActiveTab('reports')}
        onNavigateToInventory={() => setActiveTab('inventory')}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={tab => setActiveTab(tab)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          {renderActiveView()}
        </main>

        {/* Mobile Navigation Floating Bar / Drawer Trigger */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-3 py-2 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === 'pos' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Zap className="h-5 w-5" />
            <span>POS</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === 'inventory' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Stock</span>
          </button>

          <button
            onClick={() => setIsScannerModalOpen(true)}
            className="flex h-11 w-11 -mt-5 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
          >
            <Barcode className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === 'reports' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
            }`}
          >
            <FileBarChart className="h-5 w-5" />
            <span>Reportes</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <Menu className="h-5 w-5" />
            <span>Menú</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-black text-slate-800 dark:text-white">Menú Completo de Módulos</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {mobileNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl text-left text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hardware Modals */}
      <HardwareScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onDetectedCode={code => {
          alert(`Código detectado por el escáner: ${code}`);
        }}
      />

      <DigitalScaleModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppContextProvider>
      <MainLayout />
    </AppContextProvider>
  );
}
