import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Cloud,
  RefreshCw,
  Coffee,
  Shield,
  UserCheck,
  AlertTriangle,
  Clock,
  Store,
  ChevronDown,
  HardDriveDownload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CoffeeDonateModal } from '../common/CoffeeDonateModal';
import { LicenseModal } from '../common/LicenseModal';
import { DEVELOPER_INFO } from '../../domain/constants';

interface Props {
  onNavigateToReports?: () => void;
  onNavigateToInventory?: () => void;
}

export const Navbar: React.FC<Props> = ({ onNavigateToReports, onNavigateToInventory }) => {
  const {
    theme,
    toggleTheme,
    syncStatus,
    triggerCloudSync,
    triggerDriveBackup,
    currentUser,
    users,
    switchUser,
    products,
    activeCashRegister,
    businessConfig,
  } = useApp();

  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Compute low stock count
  const lowStockCount = products.filter(
    p => p.type === 'producto' && p.currentStock <= p.minStock
  ).length;

  // Compute products near expiration (within 30 days) or expired
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expirationAlertCount = products.filter(p => {
    if (!p.expirationDate) return false;
    const exp = new Date(p.expirationDate);
    return exp <= thirtyDaysLater;
  }).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 md:px-6">
        {/* Left: Brand & Business Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-2 text-white shadow-md shadow-indigo-500/20">
            {businessConfig.logoUrl ? (
              <img
                src={businessConfig.logoUrl}
                alt="Logo"
                className="h-full w-full object-contain rounded-xl"
              />
            ) : (
              <Store className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white md:text-base">
                {businessConfig.name}
              </h1>
              <span className="hidden rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 sm:inline-block">
                v2.5 Clean Arch
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {businessConfig.commercialName} • RUC: {businessConfig.taxId}
            </p>
          </div>
        </div>

        {/* Center/Right: Action Badges & Integrations */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Active Cash Register Badge */}
          {activeCashRegister ? (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeCashRegister.code}: C$ {activeCashRegister.expectedCashInDrawer.toFixed(2)}</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Caja Cerrada</span>
            </div>
          )}

          {/* Low Stock Alert Badge */}
          {lowStockCount > 0 && (
            <button
              onClick={onNavigateToInventory}
              title={`${lowStockCount} productos con stock bajo`}
              className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="hidden sm:inline">Stock Bajo:</span>
              <span className="rounded-full bg-amber-200 px-1.5 py-0.2 text-[10px] font-black dark:bg-amber-900">
                {lowStockCount}
              </span>
            </button>
          )}

          {/* Expiration Alert Badge */}
          {expirationAlertCount > 0 && (
            <button
              onClick={onNavigateToInventory}
              title={`${expirationAlertCount} productos por vencer o vencidos`}
              className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
            >
              <Clock className="h-4 w-4 text-rose-600" />
              <span className="hidden sm:inline">Vencimientos:</span>
              <span className="rounded-full bg-rose-200 px-1.5 py-0.2 text-[10px] font-black dark:bg-rose-900">
                {expirationAlertCount}
              </span>
            </button>
          )}

          {/* Cloud Sync & Google Drive Backup Button */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={triggerCloudSync}
              disabled={syncStatus === 'syncing'}
              title="Sincronización Automática en la Nube"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white transition-all dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Cloud className={`h-4 w-4 text-sky-500 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">{syncStatus === 'syncing' ? 'Sincronizando...' : 'Nube'}</span>
            </button>
            <button
              onClick={triggerDriveBackup}
              title="Copia de Seguridad a Google Drive"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white transition-all dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <HardDriveDownload className="h-3.5 w-3.5 text-indigo-500" />
              <span className="hidden xl:inline">Drive Backup</span>
            </button>
          </div>

          {/* Day / Night Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar modo día y modo noche"
            title={theme === 'dark' ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-amber-400 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Invítame un café Button */}
          <button
            onClick={() => setIsCoffeeOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all"
            title="Cuentas bancarias de Maxwell Chacón (LAFISE)"
          >
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">Invítame un café</span>
          </button>

          {/* License button */}
          <button
            onClick={() => setIsLicenseOpen(true)}
            title="Licencia de Software y Derechos"
            className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Licencia</span>
          </button>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="h-7 w-7 rounded-lg object-cover"
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
                  {currentUser.name}
                </p>
                <span className="rounded bg-indigo-100 px-1 py-0.2 text-[9px] font-black uppercase text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Cambiar de Usuario</p>
                  <p className="text-[11px] text-slate-500">Prueba los diferentes roles y permisos</p>
                </div>
                <div className="mt-1 space-y-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-indigo-50 font-bold text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
                        <div>
                          <p className="leading-tight">{u.name}</p>
                          <span className="text-[10px] text-slate-400 font-normal uppercase">{u.role}</span>
                        </div>
                      </div>
                      {currentUser.id === u.id && <UserCheck className="h-4 w-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Coffee Modal */}
      <CoffeeDonateModal isOpen={isCoffeeOpen} onClose={() => setIsCoffeeOpen(false)} />

      {/* License Modal */}
      <LicenseModal isOpen={isLicenseOpen} onClose={() => setIsLicenseOpen(false)} />
    </>
  );
};
