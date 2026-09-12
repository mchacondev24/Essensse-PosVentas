import React, { useState } from 'react';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  DollarSign,
  Plus,
  FileSpreadsheet,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreditAccount } from '../../domain/types';
import { ExcelExportService } from '../../infrastructure/exporters/excelGenerator';
import { PdfExportService } from '../../infrastructure/exporters/pdfGenerator';

export const CreditsView: React.FC = () => {
  const { creditAccounts, addCreditPayment, businessConfig, hasPermission } = useApp();

  const [activeType, setActiveType] = useState<'por_cobrar' | 'por_pagar'>('por_cobrar');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendiente' | 'parcial' | 'pagado'>('todos');
  const [paymentModalAccount, setPaymentModalAccount] = useState<CreditAccount | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const accounts = creditAccounts.filter(acc => {
    const matchType = acc.type === activeType;
    const matchStatus = filterStatus === 'todos' || acc.status === filterStatus;
    return matchType && matchStatus;
  });

  const totalReceivable = creditAccounts
    .filter(a => a.type === 'por_cobrar' && a.status !== 'pagado')
    .reduce((acc, a) => acc + (a.totalAmount - a.paidAmount), 0);

  const totalPayable = creditAccounts
    .filter(a => a.type === 'por_pagar' && a.status !== 'pagado')
    .reduce((acc, a) => acc + (a.totalAmount - a.paidAmount), 0);

  const handleOpenPayment = (acc: CreditAccount) => {
    setPaymentModalAccount(acc);
    setPaymentAmount(Number((acc.totalAmount - acc.paidAmount).toFixed(2)));
    setPaymentNotes('Abono a cuenta');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalAccount || paymentAmount <= 0) return;

    addCreditPayment(paymentModalAccount.id, paymentAmount, paymentNotes);
    setPaymentModalAccount(null);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      'Fecha Emisión',
      'Factura/Ref',
      activeType === 'por_cobrar' ? 'Cliente' : 'Proveedor',
      'Monto Total',
      'Monto Abonado',
      'Saldo Pendiente',
      'Fecha Vencimiento',
      'Estado',
    ];

    const rows = accounts.map(a => [
      new Date(a.issueDate).toLocaleDateString(),
      a.invoiceNumber,
      a.contactName,
      a.totalAmount,
      a.paidAmount,
      a.totalAmount - a.paidAmount,
      new Date(a.dueDate).toLocaleDateString(),
      a.status.toUpperCase(),
    ]);

    ExcelExportService.exportToExcel(
      activeType === 'por_cobrar' ? 'Cuentas_Por_Cobrar' : 'Cuentas_Por_Pagar',
      'Créditos',
      headers,
      rows
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestión de Ventas y Compras al Crédito
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de cuentas por cobrar a clientes y cuentas por pagar a proveedores con abonos parciales
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveType('por_cobrar')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeType === 'por_cobrar'
              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 dark:border-indigo-500/80 shadow-md'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Cuentas por Cobrar (Clientes)
            </span>
            <ArrowDownLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            {businessConfig.currencySymbol} {totalReceivable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Saldo pendiente por cobrar de ventas a crédito</p>
        </div>

        <div
          onClick={() => setActiveType('por_pagar')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeType === 'por_pagar'
              ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/30 dark:border-violet-500/80 shadow-md'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
              Cuentas por Pagar (Proveedores)
            </span>
            <ArrowUpRight className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            {businessConfig.currencySymbol} {totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Saldo adeudado por compras de mercancía a plazo</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['todos', 'pendiente', 'parcial', 'pagado'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Factura / Ref</th>
                <th className="px-4 py-3">{activeType === 'por_cobrar' ? 'Cliente' : 'Proveedor'}</th>
                <th className="px-4 py-3">Fecha Emisión</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3 text-right">Total Factura</th>
                <th className="px-4 py-3 text-right">Abonado</th>
                <th className="px-4 py-3 text-right">Saldo Pendiente</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No hay cuentas de crédito en esta categoría.
                  </td>
                </tr>
              ) : (
                accounts.map(acc => {
                  const pending = acc.totalAmount - acc.paidAmount;
                  const isOverdue = new Date(acc.dueDate) < new Date() && acc.status !== 'pagado';

                  return (
                    <tr
                      key={acc.id}
                      className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {acc.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {acc.contactName}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(acc.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-mono">
                          {isOverdue && <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                            {new Date(acc.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {businessConfig.currencySymbol} {acc.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {businessConfig.currencySymbol} {acc.paidAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-slate-900 dark:text-white">
                        {businessConfig.currencySymbol} {pending.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            acc.status === 'pagado'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : acc.status === 'parcial'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {acc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {acc.status !== 'pagado' && (
                          <button
                            onClick={() => handleOpenPayment(acc)}
                            className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                          >
                            + Abonar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Registrar Abono a Cuenta
              </h3>
              <button onClick={() => setPaymentModalAccount(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiario / Contacto:</span>
                  <strong className="text-slate-800 dark:text-slate-100">{paymentModalAccount.contactName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Factura:</span>
                  <span className="font-mono font-bold">{paymentModalAccount.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-bold">
                  <span>Saldo Actual Pendiente:</span>
                  <span className="font-mono">
                    {businessConfig.currencySymbol} {(paymentModalAccount.totalAmount - paymentModalAccount.paidAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Monto a Abonar ({businessConfig.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={paymentModalAccount.totalAmount - paymentModalAccount.paidAmount}
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-base font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Notas / Referencia de Pago:
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="Ej: Transferencia Bancaria, Pago en efectivo..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalAccount(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
