import React, { useState } from 'react';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  User,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryMovement, MovementType } from '../../domain/types';
import { ExcelExportService } from '../../infrastructure/exporters/excelGenerator';
import { PdfExportService } from '../../infrastructure/exporters/pdfGenerator';

export const KardexView: React.FC = () => {
  const { movements, products, recordMovement, businessConfig, currentUser, hasPermission } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>('todos');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Manual Adjustment Form
  const [adjustData, setAdjustData] = useState({
    productId: products[0]?.id || '',
    type: 'ajuste_positivo' as MovementType,
    quantity: 1,
    unitCost: 0,
    reason: '',
  });

  const filtered = movements.filter(m => {
    const matchProd = selectedProductId === 'todos' || m.productId === selectedProductId;
    const matchType = selectedType === 'todos' || m.type === selectedType;
    const matchSearch =
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.productCode.toLowerCase().includes(search.toLowerCase()) ||
      m.userName.toLowerCase().includes(search.toLowerCase()) ||
      (m.reference && m.reference.toLowerCase().includes(search.toLowerCase())) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));

    return matchProd && matchType && matchSearch;
  });

  const handleOpenAdjust = () => {
    const defaultProd = products[0];
    setAdjustData({
      productId: defaultProd?.id || '',
      type: 'ajuste_positivo',
      quantity: 1,
      unitCost: defaultProd ? defaultProd.purchasePrice : 0,
      reason: 'Ajuste de inventario físico',
    });
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustData.productId || adjustData.quantity <= 0) {
      alert('Por favor verifique los datos del ajuste.');
      return;
    }

    recordMovement({
      productId: adjustData.productId,
      type: adjustData.type,
      quantity: Number(adjustData.quantity),
      unitCost: Number(adjustData.unitCost),
      reference: 'AJUSTE-MANUAL',
      notes: adjustData.reason,
    });

    setIsAdjustModalOpen(false);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      'Fecha / Hora',
      'Código Producto',
      'Nombre Producto',
      'Tipo Movimiento',
      'Stock Anterior',
      'Cantidad',
      'Stock Resultante',
      'Costo Unitario',
      'Costo Total',
      'Referencia',
      'Usuario Auditor',
      'Notas',
    ];

    const rows = filtered.map(m => [
      new Date(m.date).toLocaleString(),
      m.productCode,
      m.productName,
      m.type.toUpperCase(),
      m.previousStock,
      m.quantity,
      m.resultingStock,
      m.unitCost,
      m.totalCost,
      m.reference || 'N/A',
      m.userName,
      m.notes || '',
    ]);

    ExcelExportService.exportToExcel('Kardex_Movimientos', 'Kardex', headers, rows);
  };

  // Export to PDF
  const handleExportPdf = () => {
    const headers = ['Fecha', 'SKU', 'Producto', 'Tipo', 'Cant.', 'Resultante', 'Costo Total', 'Usuario'];
    const rows = filtered.map(m => [
      new Date(m.date).toLocaleDateString(),
      m.productCode,
      m.productName,
      m.type,
      m.quantity.toString(),
      m.resultingStock.toString(),
      `${businessConfig.currencySymbol} ${m.totalCost.toFixed(2)}`,
      m.userName,
    ]);

    PdfExportService.generateReportPdf(
      'Kardex Físico y Valorado de Inventarios',
      `Auditoría y trazabilidad de movimientos de almacén | Total: ${filtered.length} transacciones`,
      headers,
      rows,
      [
        { label: 'Movimientos Totales', value: filtered.length.toString() },
        {
          label: 'Valor Movilizado',
          value: `${businessConfig.currencySymbol} ${filtered
            .reduce((acc, m) => acc + m.totalCost, 0)
            .toFixed(2)}`,
        },
      ],
      businessConfig
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kardex Físico y Valorado de Mercancías
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trazabilidad exacta, cálculo de costos promedio y auditoría por usuario de cada entrada y salida
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
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400"
          >
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </button>
          {hasPermission('kardex', 'create') && (
            <button
              onClick={handleOpenAdjust}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Registrar Ajuste / Merma</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por producto, referencia o usuario..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <select
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="todos">Todos los Productos</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="todos">Todos los Tipos de Movimiento</option>
            <option value="entrada_compra">Entrada por Compra</option>
            <option value="salida_venta">Salida por Venta</option>
            <option value="ajuste_positivo">Ajuste Positivo (+)</option>
            <option value="ajuste_negativo">Ajuste Negativo (-)</option>
            <option value="devolucion_cliente">Devolución de Cliente</option>
            <option value="merma">Merma / Vencimiento</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Fecha & Hora</th>
                <th className="px-4 py-3">Producto / Código</th>
                <th className="px-4 py-3">Tipo Movimiento</th>
                <th className="px-4 py-3 text-center">Stock Ant.</th>
                <th className="px-4 py-3 text-center">Cantidad</th>
                <th className="px-4 py-3 text-center">Stock Resultante</th>
                <th className="px-4 py-3 text-right">Costo Total</th>
                <th className="px-4 py-3">Usuario Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se registran movimientos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map(mov => {
                  const isPositive = ['entrada_compra', 'ajuste_positivo', 'devolucion_cliente'].includes(
                    mov.type
                  );

                  return (
                    <tr
                      key={mov.id}
                      className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {new Date(mov.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{mov.productName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{mov.productCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {mov.type.replace('_', ' ').toUpperCase()}
                        </span>
                        {mov.reference && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{mov.reference}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-500">
                        {mov.previousStock}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold">
                        <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                          {isPositive ? '+' : '-'}
                          {mov.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {mov.resultingStock}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {businessConfig.currencySymbol} {mov.totalCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 text-xs">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{mov.userName}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Registrar Ajuste de Inventario / Merma
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Producto:</label>
                <select
                  value={adjustData.productId}
                  onChange={e => {
                    const prod = products.find(p => p.id === e.target.value);
                    setAdjustData({
                      ...adjustData,
                      productId: e.target.value,
                      unitCost: prod ? prod.purchasePrice : 0,
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                >
                  {products
                    .filter(p => p.type === 'producto')
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock actual: {p.currentStock} {p.unit})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Tipo de Ajuste:
                </label>
                <select
                  value={adjustData.type}
                  onChange={e =>
                    setAdjustData({ ...adjustData, type: e.target.value as MovementType })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="ajuste_positivo">Ajuste Positivo (+) Ingreso manual</option>
                  <option value="ajuste_negativo">Ajuste Negativo (-) Faltante</option>
                  <option value="merma">Merma o Producto Vencido / Dañado</option>
                  <option value="devolucion_cliente">Devolución de Cliente (+)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cantidad:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    required
                    value={adjustData.quantity}
                    onChange={e => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Costo Unitario:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjustData.unitCost}
                    onChange={e => setAdjustData({ ...adjustData, unitCost: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Motivo / Justificación:
                </label>
                <textarea
                  rows={2}
                  value={adjustData.reason}
                  onChange={e => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="Ej: Conteo físico mensual, rotura accidental, vencimiento..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
                >
                  Aplicar al Kardex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
