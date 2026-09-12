import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Smartphone,
  ShieldCheck,
  Server,
  Database,
  Copy,
  Check,
  Coffee,
  Heart,
  FileSpreadsheet,
} from 'lucide-react';
import { CoffeeDonateModal } from '../common/CoffeeDonateModal';
import { LicenseModal } from '../common/LicenseModal';

export const ReadmeView: React.FC = () => {
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [copiedFlutter, setCopiedFlutter] = useState(false);

  const flutterArchitectureGuide = `// Clean Architecture en Flutter / Dart (Estructura equivalente)
lib/
├── core/
│   ├── network/ (Dio / HTTP clients)
│   ├── errors/ (Failures & Exceptions)
│   └── hardware/ (bluetooth_thermal_printer, usb_serial, mobile_scanner)
├── features/
│   ├── pos/
│   │   ├── domain/ (Entities: Sale, CartItem, Repository Contract)
│   │   ├── data/ (Models, Local Datasource: sqflite / drift, Remote: REST API)
│   │   └── presentation/ (Bloc / Riverpod, POS Screen, Hardware Dialogs)
│   ├── inventory/
│   │   ├── domain/ (Product, Category, Lot, ExpirationAlert)
│   │   ├── data/ (ProductRepositoryImpl, SQLite Migration)
│   │   └── presentation/ (ProductListScreen, BarcodeScannerScreen)
│   └── reports/
│       ├── domain/ (ReportEntities)
│       └── presentation/ (PdfPreview, SyncDriveScreen)
└── main.dart`;

  const handleCopyFlutter = () => {
    navigator.clipboard.writeText(flutterArchitectureGuide);
    setCopiedFlutter(true);
    setTimeout(() => setCopiedFlutter(false), 2500);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-bold tracking-wider uppercase text-indigo-200 border border-indigo-400/20">
              Clean Architecture & Guía Técnica
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">
              Sistema de Facturación, Inventarios & Hardware POS
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Desarrollado bajo principios de Clean Architecture, desacoplamiento de capas (Dominio, Casos de Uso, Infraestructura y Presentación), soporte multi-base de datos (SQLite, PostgreSQL, MySQL) y drivers directos de hardware.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsCoffeeOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Coffee className="h-4 w-4" />
              <span>Invitar un Café (Donar)</span>
            </button>
            <button
              onClick={() => setIsLicenseOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Licencia & Créditos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Clean Architecture</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Dominio independiente sin dependencias de frameworks ni UI. Facilita migración inmediata a Flutter, backend Node.js o Electron.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Multi-Base de Datos</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Generador automático de scripts DDL nativos para SQLite local (offline-first), PostgreSQL (Cloud SQL/Supabase) y MySQL.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Hardware POS Directo</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Captura global de pistolas ópticas USB/Bluetooth mediante umbral de pulsaciones (&lt;60ms) y conexión RS-232 / USB para balanzas.
          </p>
        </div>
      </div>

      {/* 10 Reports Summary */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Los 10 Reportes Estratégicos Incorporados
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">1.</span>
            <span><strong>Ventas Diarias & Métodos de Pago:</strong> Efectivo, Tarjeta, Transferencia y Crédito.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">2.</span>
            <span><strong>Top Productos Más Vendidos:</strong> Rotación de inventario y unidades despachadas.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">3.</span>
            <span><strong>Valoración de Inventario & Stock Crítico:</strong> Valuación al costo de adquisición.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">4.</span>
            <span><strong>Semáforo de Vencimiento de Lotes:</strong> Alerta de 30 días y productos vencidos.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">5.</span>
            <span><strong>Margen de Utilidad Bruta:</strong> Ingresos vs costo de mercancía vendida (CMV).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">6.</span>
            <span><strong>Antigüedad Cuentas por Cobrar:</strong> Clientes morosos, abonos y límites de crédito.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">7.</span>
            <span><strong>Cuentas por Pagar a Proveedores:</strong> Facturas a crédito pendientes y vencimientos.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">8.</span>
            <span><strong>Histórico de Arqueos de Caja:</strong> Cuadres Z/X, sobrantes y faltantes auditados.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">9.</span>
            <span><strong>IVA Fiscal & Facturación DGI:</strong> Base imponible, débito fiscal y CUFE.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono font-bold text-indigo-600">10.</span>
            <span><strong>Auditoría por Usuario / Cajero:</strong> Trazabilidad completa de cada movimiento.</span>
          </div>
        </div>
      </div>

      {/* Flutter Equivalent Blueprint */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Equivalencia de Arquitectura en Flutter
            </h3>
            <p className="text-xs text-slate-400">Estructura recomendada para empaquetado móvil Android/iOS</p>
          </div>
          <button
            onClick={handleCopyFlutter}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            {copiedFlutter ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{copiedFlutter ? 'Copiado' : 'Copiar Estructura'}</span>
          </button>
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-indigo-300 border border-slate-800 overflow-x-auto">
          <pre>{flutterArchitectureGuide}</pre>
        </div>
      </div>

      {/* Ownership & Bank Support Card */}
      <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
          <Heart className="h-5 w-5 fill-amber-500 text-amber-500" />
          <span>Apoyo al Proyecto & Cuentas Bancarias LAFISE Bancentro</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Este sistema es de libre uso en negocios comerciales. Propiedad de <strong>Maxwell Chacón (Cédula: 201-290495-0006A)</strong>. Para apoyo voluntario o donaciones de café:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="rounded-2xl bg-white p-3 border border-amber-200/60 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cuenta Amigo Córdobas</span>
            <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">138027529</p>
          </div>
          <div className="rounded-2xl bg-white p-3 border border-amber-200/60 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cuenta Amigo Dólares</span>
            <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">133258435</p>
          </div>
          <div className="rounded-2xl bg-white p-3 border border-amber-200/60 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cuenta Digital LAFISE</span>
            <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">133238477</p>
          </div>
        </div>
      </div>

      <CoffeeDonateModal isOpen={isCoffeeOpen} onClose={() => setIsCoffeeOpen(false)} />
      <LicenseModal isOpen={isLicenseOpen} onClose={() => setIsLicenseOpen(false)} />
    </div>
  );
};
