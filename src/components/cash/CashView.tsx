import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CashMovementType } from '../../domain/types';
import { ExcelExportService } from '../../infrastructure/exporters/excelGenerator';
import { PdfExportService } from '../../infrastructure/exporters/pdfGenerator';

export const CashView: React.FC = () => {
  const {
    activeCashRegister,
    cashRegisters,
    openCashRegister,
    closeCashRegister,
    addCashMovement,
    businessConfig,
    hasPermission,
  } = useApp();

  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // Form states
  const [initialCash, setInitialCash] = useState<number>(1000);
  const [closureRealCash, setClosureRealCash] = useState<number>(0);
  const [closureNotes, setClosureNotes] = useState<string>('');

  const [movType, setMovType] = useState<CashMovementType>('gasto');
  const [movAmount, setMovAmount] = useState<number>(50);
  const [movConcept, setMovConcept] = useState<string>('');

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    openCashRegister(initialCash);
    setIsOpenModalOpen(false);
  };

  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashRegister(closureRealCash, closureNotes);
    setIsCloseModalOpen(false);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (movAmount <= 0 || !movConcept) {
      alert('Por favor complete el concepto y monto.');
      return;
    }
    addCashMovement(movType, movAmount, movConcept);
    setIsMovementModalOpen(false);
    setMovConcept('');
    setMovAmount(50);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Control de Caja Chica & Arqueo de Turno
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Apertura de turno, control de gastos menores, arqueo ciego y cierre Z
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeCashRegister ? (
            <>
              <button
                onClick={() => setIsMovementModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Plus className="h-4 w-4 text-emerald-500" />
                <span>Registrar Ingreso / Gasto</span>
              </button>
              <button
                onClick={() => {
                  setClosureRealCash(activeCashRegister.expectedCashInDrawer);
                  setIsCloseModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md shadow-rose-600/20"
              >
                <Lock className="h-4 w-4" />
                <span>Cerrar / Arqueo de Caja</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpenModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
            >
              <Unlock className="h-4 w-4" />
              <span>Abrir Turno de Caja</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Cash Box Status */}
      {activeCashRegister ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {activeCashRegister.code} — Turno Activo
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
                    EN OPERACIÓN
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Cajero: <strong>{activeCashRegister.userName}</strong> • Abierta el{' '}
                  {new Date(activeCashRegister.openedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Efectivo Esperado en Gaveta
              </span>
              <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {businessConfig.currencySymbol} {activeCashRegister.expectedCashInDrawer.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
              <span className="text-slate-400 font-semibold">Fondo Inicial:</span>
              <p className="mt-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                {businessConfig.currencySymbol} {activeCashRegister.initialCash.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
              <span className="text-slate-400 font-semibold">Ventas en Efectivo:</span>
              <p className="mt-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                + {businessConfig.currencySymbol} {activeCashRegister.cashSalesTotal.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
              <span className="text-slate-400 font-semibold">Otros Ingresos:</span>
              <p className="mt-1 font-mono font-bold text-sky-600 dark:text-sky-400">
                + {businessConfig.currencySymbol} {activeCashRegister.cashInflowTotal.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
              <span className="text-slate-400 font-semibold">Gastos / Retiros:</span>
              <p className="mt-1 font-mono font-bold text-rose-600 dark:text-rose-400">
                - {businessConfig.currencySymbol} {activeCashRegister.cashOutflowTotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Movements list of this register */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Movimientos del Turno Actual ({activeCashRegister.movements.length})
            </h4>

            {activeCashRegister.movements.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">No hay movimientos en este turno aún.</p>
            ) : (
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850">
                {activeCashRegister.movements.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      {m.type === 'ingreso' || m.type === 'venta_efectivo' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          <ArrowDownLeft className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{m.concept}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(m.date).toLocaleTimeString()} • {m.type.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-mono font-bold text-sm ${
                        m.type === 'gasto' || m.type === 'retiro'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {m.type === 'gasto' || m.type === 'retiro' ? '-' : '+'}
                      {businessConfig.currencySymbol} {m.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Wallet className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-100">
            No hay ninguna caja abierta en este momento
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Para registrar ventas en efectivo y controlar la gaveta, abre un turno con el fondo inicial.
          </p>
          <button
            onClick={() => setIsOpenModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
          >
            <Unlock className="h-4 w-4" />
            Abrir Caja Ahora
          </button>
        </div>
      )}

      {/* Historical Cash Closures */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Historial de Turnos y Cierres Anteriores
        </h3>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Código Turno</th>
                  <th className="px-4 py-3">Cajero</th>
                  <th className="px-4 py-3">Apertura</th>
                  <th className="px-4 py-3">Cierre</th>
                  <th className="px-4 py-3 text-right">Fondo Inicial</th>
                  <th className="px-4 py-3 text-right">Efectivo Real</th>
                  <th className="px-4 py-3 text-right">Diferencia</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cashRegisters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      No hay historial de cajas cerradas.
                    </td>
                  </tr>
                ) : (
                  cashRegisters.map(reg => (
                    <tr
                      key={reg.id}
                      className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {reg.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {reg.userName}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(reg.openedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {reg.closedAt ? new Date(reg.closedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {businessConfig.currencySymbol} {reg.initialCash.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {reg.actualCashCounted !== undefined
                          ? `${businessConfig.currencySymbol} ${reg.actualCashCounted.toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {reg.difference !== undefined ? (
                          <span
                            className={
                              reg.difference === 0
                                ? 'text-emerald-600 font-bold'
                                : reg.difference > 0
                                ? 'text-sky-600 font-bold'
                                : 'text-rose-600 font-bold'
                            }
                          >
                            {reg.difference > 0 ? '+' : ''}
                            {businessConfig.currencySymbol} {reg.difference.toFixed(2)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            reg.status === 'abierta'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {reg.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Open Cash Register */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Apertura de Turno de Caja
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ingrese el monto en efectivo con el que iniciará la gaveta (cambio inicial).
            </p>

            <form onSubmit={handleOpenRegister} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Fondo Inicial de Efectivo ({businessConfig.currencySymbol}):
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  required
                  value={initialCash}
                  onChange={e => setInitialCash(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xl font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpenModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
                >
                  Confirmar Apertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Close Cash Register / Arqueo */}
      {isCloseModalOpen && activeCashRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Arqueo y Cierre de Turno (Corte Z)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Conteo físico del dinero en gaveta para validar diferencias con el sistema.
            </p>

            <form onSubmit={handleCloseRegister} className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between">
                  <span>Efectivo Teórico / Esperado:</span>
                  <strong className="font-mono text-indigo-600 dark:text-indigo-400">
                    {businessConfig.currencySymbol} {activeCashRegister.expectedCashInDrawer.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Efectivo Físico Contado en Gaveta:
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={closureRealCash}
                  onChange={e => setClosureRealCash(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xl font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Diferencia:</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    closureRealCash - activeCashRegister.expectedCashInDrawer === 0
                      ? 'text-emerald-600'
                      : closureRealCash - activeCashRegister.expectedCashInDrawer > 0
                      ? 'text-sky-600'
                      : 'text-rose-600'
                  }`}
                >
                  {closureRealCash - activeCashRegister.expectedCashInDrawer > 0 ? '+' : ''}
                  {businessConfig.currencySymbol}{' '}
                  {(closureRealCash - activeCashRegister.expectedCashInDrawer).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Observaciones de Cierre:
                </label>
                <textarea
                  rows={2}
                  value={closureNotes}
                  onChange={e => setClosureNotes(e.target.value)}
                  placeholder="Detalles sobre el arqueo, entrega de gaveta al siguiente turno..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md"
                >
                  Confirmar y Cerrar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Inflow / Outflow */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Registrar Movimiento de Caja Menor
            </h3>

            <form onSubmit={handleAddMovement} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Tipo de Movimiento:
                </label>
                <select
                  value={movType}
                  onChange={e => setMovType(e.target.value as CashMovementType)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="gasto">Gasto Operativo Menor (-)</option>
                  <option value="retiro">Retiro Parcial / Bóveda (-)</option>
                  <option value="ingreso">Ingreso Adicional de Efectivo (+)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Monto ({businessConfig.currencySymbol}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.1"
                  value={movAmount}
                  onChange={e => setMovAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-base font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Concepto / Motivo:</label>
                <input
                  type="text"
                  required
                  value={movConcept}
                  onChange={e => setMovConcept(e.target.value)}
                  placeholder="Ej: Pago de flete, compra de papelería, recarga..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
