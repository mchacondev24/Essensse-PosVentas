import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Barcode,
  QrCode,
  Edit2,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  Scale,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ItemType, Product, UnitOfMeasure } from '../../domain/types';
import { BRANDS, CATEGORIES, UNITS } from '../../domain/constants';
import { ExcelExportService } from '../../infrastructure/exporters/excelGenerator';
import { PdfExportService } from '../../infrastructure/exporters/pdfGenerator';
import { HardwareScannerModal } from '../common/HardwareScannerModal';

export const ProductsView: React.FC = () => {
  const { products, suppliers, saveProduct, deleteProduct, businessConfig, hasPermission } = useApp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterAlert, setFilterAlert] = useState<'all' | 'low_stock' | 'expiring' | 'expired'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    type: 'producto',
    category: CATEGORIES[0],
    brand: BRANDS[0],
    supplierId: suppliers[0]?.id || '',
    unit: 'UND',
    purchasePrice: 0,
    salePrice: 0,
    minPrice: 0,
    wholesalePrice: 0,
    currentStock: 0,
    minStock: 5,
    lotNumber: '',
    expirationDate: '',
    isScaleProduct: false,
    taxPercent: 15,
    status: 'active',
  });

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Filter products
  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      (p.lotNumber && p.lotNumber.toLowerCase().includes(search.toLowerCase()));

    const matchCat = filterCategory === 'todas' || p.category === filterCategory;
    const matchType = filterType === 'todos' || p.type === filterType;

    let matchAlert = true;
    if (filterAlert === 'low_stock') {
      matchAlert = p.type === 'producto' && p.currentStock <= p.minStock;
    } else if (filterAlert === 'expired') {
      matchAlert = Boolean(p.expirationDate && new Date(p.expirationDate) < now);
    } else if (filterAlert === 'expiring') {
      if (!p.expirationDate) matchAlert = false;
      else {
        const d = new Date(p.expirationDate);
        matchAlert = d >= now && d <= thirtyDaysLater;
      }
    }

    return matchSearch && matchCat && matchType && matchAlert;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      id: 'prod-' + Date.now(),
      name: '',
      code: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      type: 'producto',
      category: CATEGORIES[0],
      brand: BRANDS[0],
      supplierId: suppliers[0]?.id || '',
      unit: 'UND',
      purchasePrice: 0,
      salePrice: 0,
      minPrice: 0,
      wholesalePrice: 0,
      currentStock: 0,
      minStock: 5,
      lotNumber: 'LT-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      expirationDate: '',
      isScaleProduct: false,
      taxPercent: 15,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Por favor complete el nombre y código del producto.');
      return;
    }

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : formData.id || 'prod-' + Date.now(),
      code: formData.code!,
      name: formData.name!,
      type: (formData.type as ItemType) || 'producto',
      category: formData.category || CATEGORIES[0],
      brand: formData.brand || 'Genérico',
      supplierId: formData.supplierId,
      unit: (formData.unit as UnitOfMeasure) || 'UND',
      purchasePrice: Number(formData.purchasePrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      minPrice: Number(formData.minPrice) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || 0,
      currentStock: Number(formData.currentStock) || 0,
      minStock: Number(formData.minStock) || 0,
      lotNumber: formData.lotNumber,
      expirationDate: formData.expirationDate || undefined,
      isScaleProduct: Boolean(formData.isScaleProduct),
      taxPercent: Number(formData.taxPercent) || 0,
      status: formData.status || 'active',
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProduct(productToSave);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      deleteProduct(id);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      'Código/SKU',
      'Nombre',
      'Tipo',
      'Categoría',
      'Marca',
      'Unidad',
      'Costo Compra',
      'Precio Venta',
      'Stock Actual',
      'Stock Mínimo',
      'Lote',
      'Vencimiento',
      'Báscula',
    ];

    const rows = filtered.map(p => [
      p.code,
      p.name,
      p.type.toUpperCase(),
      p.category,
      p.brand,
      p.unit,
      p.purchasePrice,
      p.salePrice,
      p.currentStock,
      p.minStock,
      p.lotNumber || 'N/A',
      p.expirationDate || 'N/A',
      p.isScaleProduct ? 'SÍ' : 'NO',
    ]);

    ExcelExportService.exportToExcel('Inventario_Productos', 'Productos', headers, rows);
  };

  // Export to PDF
  const handleExportPdf = () => {
    const headers = ['Código', 'Descripción', 'Categoría', 'Stock', 'U.M.', 'Costo', 'Precio', 'Vencimiento'];
    const rows = filtered.map(p => [
      p.code,
      p.name,
      p.category,
      p.currentStock,
      p.unit,
      `${businessConfig.currencySymbol} ${p.purchasePrice.toFixed(2)}`,
      `${businessConfig.currencySymbol} ${p.salePrice.toFixed(2)}`,
      p.expirationDate || 'N/D',
    ]);

    PdfExportService.generateReportPdf(
      'Catálogo e Inventario de Productos',
      `Filtro: ${filterCategory} | Total registros: ${filtered.length}`,
      headers,
      rows,
      [
        { label: 'Total Ítems', value: filtered.length.toString() },
        {
          label: 'Valor en Inventario',
          value: `${businessConfig.currencySymbol} ${filtered
            .reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0)
            .toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      ],
      businessConfig
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventario & Catálogo de Productos y Servicios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de stock en tiempo real, lotes, alertas de vencimiento y compatibilidad con básculas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setScannerModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Barcode className="h-4 w-4 text-indigo-500" />
            <span>Etiquetas & Pistolas</span>
          </button>
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
          {hasPermission('inventory', 'create') && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Producto / Servicio</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código, nombre, marca o lote..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="todas">Todas las Categorías</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="todos">Productos y Servicios</option>
            <option value="producto">Solo Productos Físicos</option>
            <option value="servicio">Solo Servicios</option>
          </select>
        </div>

        <div>
          <select
            value={filterAlert}
            onChange={e => setFilterAlert(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Todas las Alertas</option>
            <option value="low_stock">⚠️ Stock Bajo</option>
            <option value="expiring">⏳ Por Vencer (&lt;30 días)</option>
            <option value="expired">🛑 Ya Vencidos</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Código / SKU</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Categoría & Marca</th>
                <th className="px-4 py-3 text-right">Costo</th>
                <th className="px-4 py-3 text-right">Precio Venta</th>
                <th className="px-4 py-3 text-center">Stock Actual</th>
                <th className="px-4 py-3 text-center">Lote & Vencimiento</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron productos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map(product => {
                  const isLow = product.type === 'producto' && product.currentStock <= product.minStock;
                  let expirationBadge: React.ReactNode = null;
                  if (product.expirationDate) {
                    const exp = new Date(product.expirationDate);
                    if (exp < now) {
                      expirationBadge = (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          Vencido ({product.expirationDate})
                        </span>
                      );
                    } else if (exp <= thirtyDaysLater) {
                      expirationBadge = (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Vence pronto ({product.expirationDate})
                        </span>
                      );
                    } else {
                      expirationBadge = (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {product.expirationDate}
                        </span>
                      );
                    }
                  }

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {product.code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{product.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Unidad: {product.unit}</span>
                          {product.isScaleProduct && (
                            <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                              <Scale className="h-3 w-3" /> Balanza
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <div>{product.category}</div>
                        <div className="text-[10px] text-slate-400">{product.brand}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {businessConfig.currencySymbol} {product.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {businessConfig.currencySymbol} {product.salePrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.type === 'servicio' ? (
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                            Servicio
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold font-mono ${
                              isLow
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {isLow && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                            {product.currentStock} {product.unit}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                          {product.lotNumber || '—'}
                        </div>
                        <div>{expirationBadge}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {hasPermission('inventory', 'delete') && (
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingProduct ? 'Editar Producto / Servicio' : 'Nuevo Producto o Servicio'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Nombre o Descripción *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Código / Barcode *
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      required
                      value={formData.code || ''}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as ItemType })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="producto">Producto Físico</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Marca</label>
                  <select
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    {BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Unidad de Medida</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value as UnitOfMeasure })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  >
                    {UNITS.map(u => (
                      <option key={u.code} value={u.code}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prices & Costs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Costo de Compra</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice || ''}
                    onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Precio de Venta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice || ''}
                    onChange={e => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs font-bold text-indigo-600 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Precio Mayorista</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wholesalePrice || ''}
                    onChange={e => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">IVA (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.taxPercent ?? 15}
                    onChange={e => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Stock & Lots */}
              {formData.type === 'producto' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Stock Inicial</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.currentStock ?? 0}
                      onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Stock Mínimo</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.minStock ?? 5}
                      onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nº de Lote</label>
                    <input
                      type="text"
                      value={formData.lotNumber || ''}
                      onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={formData.expirationDate || ''}
                      onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* Hardware & Scale Flag */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isScaleProduct)}
                    onChange={e => setFormData({ ...formData, isScaleProduct: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Requiere Báscula / Balanza Digital para pesaje (arroz, queso, carnes, etc.)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hardware Scanner modal */}
      <HardwareScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
      />
    </div>
  );
};
