import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CreditCard,
  CheckCircle2,
  Calendar,
  Building,
  FileSpreadsheet,
  FileText,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Purchase, PurchaseItem, Supplier } from '../../domain/types';
import { ExcelExportService } from '../../infrastructure/exporters/excelGenerator';
import { PdfExportService } from '../../infrastructure/exporters/pdfGenerator';

export const PurchasesView: React.FC = () => {
  const { purchases, suppliers, products, createPurchase, businessConfig, hasPermission } = useApp();

  const [search, setSearch] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Purchase Form
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('FAC-PROV-' + Math.floor(1000 + Math.random() * 9000));
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [creditDays, setCreditDays] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  // Add Item Line
  const [itemProductId, setItemProductId] = useState<string>(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState<number>(10);
  const [itemUnitCost, setItemUnitCost] = useState<number>(products[0]?.purchasePrice || 0);
  const [itemLotNumber, setItemLotNumber] = useState<string>('LT-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900));
  const [itemExpirationDate, setItemExpirationDate] = useState<string>('');

  const filtered = purchases.filter(p => {
    const matchSupplier = filterSupplier === 'todos' || p.supplierId === filterSupplier;
    const matchSearch =
      p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    return matchSupplier && matchSearch;
  });

  const handleAddItem = () => {
    const prod = products.find(p => p.id === itemProductId);
    if (!prod) return;

    const subtotal = Number((itemQuantity * itemUnitCost).toFixed(2));
    const taxAmount = Number(((subtotal * prod.taxPercent) / 100).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    const newItem: PurchaseItem = {
      productId: prod.id,
      code: prod.code,
      name: prod.name,
      unit: prod.unit,
      quantity: itemQuantity,
      unitCost: itemUnitCost,
      subtotal,
      taxAmount,
      total,
      lotNumber: itemLotNumber,
      expirationDate: itemExpirationDate || undefined,
    };

    setPurchaseItems([...purchaseItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const subtotal = Number(purchaseItems.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2));
  const taxTotal = Number(purchaseItems.reduce((acc, it) => acc + it.taxAmount, 0).toFixed(2));
  const total = Number((subtotal + taxTotal).toFixed(2));

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      alert('Debe agregar al menos un artículo a la compra.');
      return;
    }

    const supp = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

    createPurchase({
      supplierId: supp.id,
      supplierName: supp.name,
      invoiceNumber,
      items: purchaseItems,
      subtotal,
      taxTotal,
      total,
      paymentMethod: isCredit ? 'credito' : 'efectivo',
      isCredit,
      creditDays: isCredit ? creditDays : undefined,
      notes,
    });

    setIsModalOpen(false);
    setPurchaseItems([]);
    setNotes('');
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      'Fecha',
      'Factura Proveedor',
      'Proveedor',
      'Método',
      'Crédito',
      'Total',
      'Estado',
      'Registrado Por',
    ];

    const rows = filtered.map(p => [
      new Date(p.date).toLocaleDateString(),
      p.invoiceNumber,
      p.supplierName,
      p.paymentMethod.toUpperCase(),
      p.isCredit ? 'SÍ (Crédito)' : 'NO (Contado)',
      p.total,
      p.status.toUpperCase(),
      p.userName,
    ]);

    ExcelExportService.exportToExcel('Compras_Proveedores', 'Compras', headers, rows);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Compras de Mercancía a Proveedores
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recepción de facturas de compra, actualización de costos, lotes y cuentas por pagar
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
          {hasPermission('purchases', 'create') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Nueva Compra</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por factura o proveedor..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <select
            value={filterSupplier}
            onChange={e => setFilterSupplier(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="todos">Todos los Proveedores</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Nº Factura Proveedor</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Condición</th>
                <th className="px-4 py-3 text-center">Ítems</th>
                <th className="px-4 py-3 text-right">Total Factura</th>
                <th className="px-4 py-3">Registrado Por</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se han registrado compras a proveedores aún.
                  </td>
                </tr>
              ) : (
                filtered.map(purch => (
                  <tr
                    key={purch.id}
                    className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {new Date(purch.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {purch.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{purch.supplierName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          purch.isCredit
                            ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {purch.isCredit ? `Crédito (${purch.creditDays}d)` : 'Contado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{purch.items.length}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {businessConfig.currencySymbol} {purch.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{purch.userName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Ingresado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Registrar Factura de Compra de Mercancía
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Proveedor:</label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Nº Factura de Proveedor:
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Condición:</label>
                  <select
                    value={isCredit ? 'credito' : 'contado'}
                    onChange={e => setIsCredit(e.target.value === 'credito')}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="contado">De Contado</option>
                    <option value="credito">Al Crédito (Cuenta por Pagar)</option>
                  </select>
                </div>
              </div>

              {/* Add line */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Agregar Ítem a la Factura
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-500">Producto:</label>
                    <select
                      value={itemProductId}
                      onChange={e => {
                        const pr = products.find(p => p.id === e.target.value);
                        setItemProductId(e.target.value);
                        if (pr) setItemUnitCost(pr.purchasePrice);
                      }}
                      className="mt-0.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 text-xs dark:bg-slate-800 dark:border-slate-700"
                    >
                      {products
                        .filter(p => p.type === 'producto')
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500">Cantidad:</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={itemQuantity}
                      onChange={e => setItemQuantity(Number(e.target.value))}
                      className="mt-0.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500">Costo Unit.:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemUnitCost}
                      onChange={e => setItemUnitCost(Number(e.target.value))}
                      className="mt-0.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500">Lote Asignado:</label>
                    <input
                      type="text"
                      value={itemLotNumber}
                      onChange={e => setItemLotNumber(e.target.value)}
                      className="mt-0.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Fecha de Vencimiento:</label>
                    <input
                      type="date"
                      value={itemExpirationDate}
                      onChange={e => setItemExpirationDate(e.target.value)}
                      className="mt-0.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Detalle de la Compra ({purchaseItems.length} ítems)
                </h4>
                {purchaseItems.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No ha agregado ningún ítem aún.</p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {purchaseItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {item.quantity} {item.unit} x C$ {item.unitCost.toFixed(2)} | Lote: {item.lotNumber || 'S/L'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            C$ {item.total.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-2 text-right">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between gap-8">
                    <span>Subtotal:</span>
                    <span className="font-mono">{businessConfig.currencySymbol} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>IVA:</span>
                    <span className="font-mono">{businessConfig.currencySymbol} {taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-sm font-bold text-slate-900 dark:text-white">
                    <span>Total a Pagar:</span>
                    <span className="font-mono text-base text-indigo-600 dark:text-indigo-400">
                      {businessConfig.currencySymbol} {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
                >
                  Confirmar e Ingresar a Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
