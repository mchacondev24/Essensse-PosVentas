import React from 'react';
import {
  Zap,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  Wallet,
  Users2,
  FileBarChart,
  Scale,
  ShieldCheck,
  FileCheck2,
  Settings,
  Code2,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type ActiveTab =
  | 'pos'
  | 'inventory'
  | 'kardex'
  | 'purchases'
  | 'credits'
  | 'cash'
  | 'contacts'
  | 'fiscal'
  | 'reports'
  | 'hardware'
  | 'users'
  | 'settings'
  | 'swagger'
  | 'readme';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { hasPermission } = useApp();

  const navItems = [
    {
      id: 'pos' as ActiveTab,
      label: 'Punto de Venta',
      sublabel: 'Facturación Rápida',
      icon: Zap,
      color: 'text-amber-600 dark:text-amber-400',
      bgTint: 'bg-amber-100 dark:bg-amber-900/40',
      bg: 'group-hover:bg-amber-500/10',
      allowed: hasPermission('pos', 'read'),
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Productos & Servicios',
      sublabel: 'Stock en Tiempo Real',
      icon: Package,
      color: 'text-sky-600 dark:text-sky-400',
      bgTint: 'bg-sky-100 dark:bg-sky-900/40',
      bg: 'group-hover:bg-sky-500/10',
      allowed: hasPermission('inventory', 'read'),
    },
    {
      id: 'kardex' as ActiveTab,
      label: 'Kardex & Movimientos',
      sublabel: 'Auditoría por Usuario',
      icon: Boxes,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgTint: 'bg-indigo-100 dark:bg-indigo-900/40',
      bg: 'group-hover:bg-indigo-500/10',
      allowed: hasPermission('kardex', 'read'),
    },
    {
      id: 'purchases' as ActiveTab,
      label: 'Compras a Proveedores',
      sublabel: 'Entrada de Mercancía',
      icon: ShoppingCart,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgTint: 'bg-emerald-100 dark:bg-emerald-900/40',
      bg: 'group-hover:bg-emerald-500/10',
      allowed: hasPermission('purchases', 'read'),
    },
    {
      id: 'credits' as ActiveTab,
      label: 'Ventas & Compras Crédito',
      sublabel: 'Cuentas Cobrar / Pagar',
      icon: CreditCard,
      color: 'text-violet-600 dark:text-violet-400',
      bgTint: 'bg-violet-100 dark:bg-violet-900/40',
      bg: 'group-hover:bg-violet-500/10',
      allowed: hasPermission('credits', 'read'),
    },
    {
      id: 'cash' as ActiveTab,
      label: 'Caja Chica & Arqueo',
      sublabel: 'Ingresos, Gastos y Cierre',
      icon: Wallet,
      color: 'text-teal-600 dark:text-teal-400',
      bgTint: 'bg-teal-100 dark:bg-teal-900/40',
      bg: 'group-hover:bg-teal-500/10',
      allowed: hasPermission('cash', 'read'),
    },
    {
      id: 'contacts' as ActiveTab,
      label: 'Clientes & Proveedores',
      sublabel: 'Directorio y Créditos',
      icon: Users2,
      color: 'text-blue-600 dark:text-blue-400',
      bgTint: 'bg-blue-100 dark:bg-blue-900/40',
      bg: 'group-hover:bg-blue-500/10',
      allowed: hasPermission('contacts', 'read'),
    },
    {
      id: 'fiscal' as ActiveTab,
      label: 'DGI Factura Electrónica',
      sublabel: 'CUFE, XML & QR Fiscal',
      icon: FileCheck2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgTint: 'bg-emerald-100 dark:bg-emerald-900/40',
      bg: 'group-hover:bg-emerald-500/10',
      allowed: true,
    },
    {
      id: 'reports' as ActiveTab,
      label: '10 Reportes (PDF/Excel)',
      sublabel: 'Ventas, Kardex, Ganancias',
      icon: FileBarChart,
      color: 'text-rose-600 dark:text-rose-400',
      bgTint: 'bg-rose-100 dark:bg-rose-900/40',
      bg: 'group-hover:bg-rose-500/10',
      allowed: hasPermission('reports', 'read'),
    },
    {
      id: 'hardware' as ActiveTab,
      label: 'Balanza & Pistolas',
      sublabel: 'Lectores Barcode & QR',
      icon: Scale,
      color: 'text-orange-600 dark:text-orange-400',
      bgTint: 'bg-orange-100 dark:bg-orange-900/40',
      bg: 'group-hover:bg-orange-500/10',
      allowed: true,
    },
    {
      id: 'users' as ActiveTab,
      label: 'Usuarios & Permisos',
      sublabel: 'Roles y Seguridad',
      icon: ShieldCheck,
      color: 'text-pink-600 dark:text-pink-400',
      bgTint: 'bg-pink-100 dark:bg-pink-900/40',
      bg: 'group-hover:bg-pink-500/10',
      allowed: hasPermission('users', 'read'),
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Configuración & BD',
      sublabel: 'SQLite, Postgres, MySQL',
      icon: Settings,
      color: 'text-slate-600 dark:text-slate-400',
      bgTint: 'bg-slate-200 dark:bg-slate-800',
      bg: 'group-hover:bg-slate-500/10',
      allowed: hasPermission('settings', 'read'),
    },
    {
      id: 'swagger' as ActiveTab,
      label: 'API Swagger en Red',
      sublabel: 'Integración Externa',
      icon: Code2,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgTint: 'bg-cyan-100 dark:bg-cyan-900/40',
      bg: 'group-hover:bg-cyan-500/10',
      allowed: hasPermission('api', 'read'),
    },
    {
      id: 'readme' as ActiveTab,
      label: 'Documentación & Flutter',
      sublabel: 'Clean Architecture Guide',
      icon: BookOpen,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgTint: 'bg-emerald-100 dark:bg-emerald-900/40',
      bg: 'group-hover:bg-emerald-500/10',
      allowed: true,
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors shrink-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems
          .filter(item => item.allowed)
          .map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${isActive ? 'bg-white/20 text-white' : `${item.bgTint} ${item.color} ${item.bg}`}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-[10px] truncate ${
                      isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
      </div>

      {/* Footer attribution */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800 text-[11px] text-slate-400 text-center">
        <p className="font-semibold text-slate-600 dark:text-slate-300">FactuPro Suite</p>
        <p className="text-[10px]">Por Maxwell Chacón</p>
      </div>
    </aside>
  );
};
