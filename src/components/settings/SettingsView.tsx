import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cloud,
  HardDriveDownload,
  Copy,
  Check,
  Building,
  RotateCcw,
  Sparkles,
  Server,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppDatabase } from '../../infrastructure/storage/database';
import { DatabaseDialect } from '../../domain/types';

export const SettingsView: React.FC = () => {
  const {
    businessConfig,
    updateBusinessConfig,
    triggerCloudSync,
    triggerDriveBackup,
    syncStatus,
  } = useApp();

  const [copiedDialect, setCopiedDialect] = useState<string | null>(null);
  const [activeDialect, setActiveDialect] = useState<DatabaseDialect>('sqlite');
  const [configForm, setConfigForm] = useState(businessConfig);
  const [isSaved, setIsSaved] = useState(false);

  const sqlSchema = AppDatabase.getInstance().generateSqlSchema(activeDialect);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedDialect(activeDialect);
    setTimeout(() => setCopiedDialect(null), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig(configForm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('¿Estás seguro de restablecer la base de datos a los valores iniciales de prueba? Se borrarán las ventas recientes.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configuración General & Motores de Base de Datos
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalización de marca comercial, datos fiscales, respaldos en la nube y esquemas SQLite / PostgreSQL / MySQL
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Info Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Datos del Negocio & Facturación
              </h3>
              <p className="text-xs text-slate-400">Aparecen en el membrete de facturas y reportes PDF</p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nombre Comercial</label>
                <input
                  type="text"
                  value={configForm.name}
                  onChange={e => setConfigForm({ ...configForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Razón Social</label>
                <input
                  type="text"
                  value={configForm.commercialName}
                  onChange={e => setConfigForm({ ...configForm, commercialName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">RUC Fiscal</label>
                <input
                  type="text"
                  value={configForm.taxId}
                  onChange={e => setConfigForm({ ...configForm, taxId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Teléfono</label>
                <input
                  type="text"
                  value={configForm.phone}
                  onChange={e => setConfigForm({ ...configForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Dirección Física</label>
              <input
                type="text"
                value={configForm.address}
                onChange={e => setConfigForm({ ...configForm, address: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Símbolo Moneda</label>
                <input
                  type="text"
                  value={configForm.currencySymbol}
                  onChange={e => setConfigForm({ ...configForm, currencySymbol: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">IVA (%)</label>
                <input
                  type="number"
                  value={configForm.taxRatePercent}
                  onChange={e => setConfigForm({ ...configForm, taxRatePercent: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Serie Facturas</label>
                <input
                  type="text"
                  value={configForm.invoiceSeries}
                  onChange={e => setConfigForm({ ...configForm, invoiceSeries: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">URL del Logotipo</label>
              <input
                type="text"
                value={configForm.logoUrl || ''}
                onChange={e => setConfigForm({ ...configForm, logoUrl: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> ¡Configuración guardada con éxito!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* Cloud & Backup Card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Sincronización en la Nube & Google Drive
                </h3>
                <p className="text-xs text-slate-400">Respaldo seguro automático de transacciones y catálogo</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200/70 dark:bg-slate-800/60 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Estado de Sincronización</span>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  ✓ Base de datos en sincronía continua
                </p>
              </div>
              <button
                onClick={triggerCloudSync}
                disabled={syncStatus === 'syncing'}
                className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400 disabled:opacity-50"
              >
                {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar Ahora'}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200/70 dark:bg-slate-800/60 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Copia de Seguridad a Google Drive</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Genera y descarga un archivo `.json` encriptado con todas las tablas
                </p>
              </div>
              <button
                onClick={triggerDriveBackup}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                <HardDriveDownload className="h-4 w-4" />
                <span>Drive Backup</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Restablecer datos demo:</span>
              <button
                onClick={handleResetData}
                className="flex items-center gap-1 text-rose-600 hover:underline font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reiniciar Base de Datos Local
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Database Dialect & SQL Generator */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Esquema SQL para SQLite, PostgreSQL y MySQL
              </h3>
              <p className="text-xs text-slate-400">
                DDL exportable con índices, llaves foráneas y tipos de datos nativos para tu servidor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(['sqlite', 'postgres', 'mysql'] as DatabaseDialect[]).map(d => (
              <button
                key={d}
                onClick={() => setActiveDialect(d)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                  activeDialect === d
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}

            <button
              onClick={handleCopySql}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                copiedDialect === activeDialect
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {copiedDialect === activeDialect ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedDialect === activeDialect ? '¡Copiado!' : 'Copiar DDL'}</span>
            </button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-200 font-mono text-xs">
          <pre className="overflow-x-auto max-h-72 scrollbar-thin scrollbar-thumb-slate-800">
            <code>{sqlSchema}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
