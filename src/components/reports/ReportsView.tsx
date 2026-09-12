import React, { useState } from 'react';
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  ShieldCheck,
  UserCheck,
  Calendar,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExcelExportService } from '../../infrastructure/exporters/excelGenerator';
import { PdfExportService } from '../../infrastructure/exporters/pdfGenerator';

export const ReportsView: React.FC = () => {
  const { sales, purchases, products, movements, creditAccounts, cashRegisters, businessConfig } = useApp();

  const [selectedReportId, setSelectedReportId] = useState<number>(1);

  // 10 Reports definitions
  const reportDefinitions = [
    {
      id: 1,
      title: 'Ventas Diarias y por Método de Pago',
      desc: 'Detalle de facturación de contado, tarjeta, transferencia y crédito',
      icon: TrendingUp,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950',
    },
    {
      id: 2,
      title: 'Top Productos Más Vendidos y Rotación',
      desc: 'Ranking de artículos con mayor volumen y demanda de clientes',
      icon: Package,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950',
    },
    {
      id: 3,
      title: 'Valoración Total de Inventario y Stock Bajo',
      desc: 'Valuación monetaria al costo y alertas de reposición inmediata',
      icon: FileBarChart,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      id: 4,
      title: 'Semáforo de Vencimiento de Lotes',
      desc: 'Productos vencidos o próximos a vencer en los siguientes 30 días',
      icon: Clock,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950',
    },
    {
      id: 5,
      title: 'Margen de Ganancia y Utilidad Bruta',
      desc: 'Diferencia entre ingresos por ventas y costo de mercancía vendida',
      icon: DollarSign,
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950',
    },
    {
      id: 6,
      title: 'Antigüedad de Cuentas por Cobrar (Clientes)',
      desc: 'Saldos pendientes de clientes, vencimientos y límites de crédito',
      icon: CreditCard,
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950',
    },
    {
      id: 7,
      title: 'Cuentas por Pagar a Proveedores',
      desc: 'Facturas de proveedores pendientes de pago y compromisos a plazo',
      icon: CreditCard,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
    },
    {
      id: 8,
      title: 'Histórico de Arqueos y Cierres de Caja Chica',
      desc: 'Control de sobrantes, faltantes y auditoría de gavetas de dinero',
      icon: Wallet,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      id: 9,
      title: 'Liquidación de IVA Fiscal y Facturas Electrónicas',
      desc: 'Resumen impositivo mensual para declaración ante la DGI',
      icon: ShieldCheck,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950',
    },
    {
      id: 10,
      title: 'Auditoría de Actividades y Transacciones por Usuario',
      desc: 'Trazabilidad de cada venta, compra, anulación o ajuste por cajero',
      icon: UserCheck,
      color: 'text-pink-500 bg-pink-50 dark:bg-pink-950',
    },
  ];

  // Helper generators for current active report
  const getReportData = () => {
    switch (selectedReportId) {
      case 1: {
        // Ventas Diarias
        const headers = ['Factura', 'Fecha', 'Cliente', 'Método', 'Subtotal', 'IVA', 'Total'];
        const rows = sales.map(s => [
          `${s.invoiceSeries}-${s.invoiceNumber}`,
          new Date(s.date).toLocaleDateString(),
          s.customerName,
          s.paymentMethod.toUpperCase(),
          `${businessConfig.currencySymbol} ${s.subtotal.toFixed(2)}`,
          `${businessConfig.currencySymbol} ${s.taxTotal.toFixed(2)}`,
          `${businessConfig.currencySymbol} ${s.total.toFixed(2)}`,
        ]);
        const totalAmount = sales.reduce((acc, s) => acc + s.total, 0);
        return {
          title: 'Reporte 1: Ventas Diarias y por Método de Pago',
          headers,
          rows,
          rawRows: sales.map(s => [
            `${s.invoiceSeries}-${s.invoiceNumber}`,
            new Date(s.date).toLocaleDateString(),
            s.customerName,
            s.paymentMethod.toUpperCase(),
            s.subtotal,
            s.taxTotal,
            s.total,
          ]),
          kpis: [
            { label: 'Total Ventas', value: `${businessConfig.currencySymbol} ${totalAmount.toFixed(2)}` },
            { label: 'Total Facturas', value: sales.length.toString() },
          ],
        };
      }

      case 2: {
        // Top Productos
        const salesMap: Record<string, { code: string; name: string; qty: number; total: number }> = {};
        sales.forEach(s => {
          s.items.forEach(it => {
            if (!salesMap[it.productId]) {
              salesMap[it.productId] = { code: it.code, name: it.name, qty: 0, total: 0 };
            }
            salesMap[it.productId].qty += it.quantity;
            salesMap[it.productId].total += it.total;
          });
        });
        const sorted = Object.values(salesMap).sort((a, b) => b.qty - a.qty);
        const headers = ['Código / SKU', 'Producto', 'Unidades Vendidas', 'Ingresos Generados'];
        const rows = sorted.map(it => [
          it.code,
          it.name,
          it.qty.toString(),
          `${businessConfig.currencySymbol} ${it.total.toFixed(2)}`,
        ]);
        return {
          title: 'Reporte 2: Top Productos Más Vendidos y Rotación',
          headers,
          rows,
          rawRows: sorted.map(it => [it.code, it.name, it.qty, it.total]),
          kpis: [
            { label: 'Artículos Vendidos', value: sorted.reduce((a, b) => a + b.qty, 0).toFixed(0) },
          ],
        };
      }

      case 3: {
        // Valoración Inventario
        const headers = ['Código', 'Producto', 'Categoría', 'Stock', 'U.M.', 'Costo Unit.', 'Valor Total'];
        const rows = products
          .filter(p => p.type === 'producto')
          .map(p => [
            p.code,
            p.name,
            p.category,
            p.currentStock.toString(),
            p.unit,
            `${businessConfig.currencySymbol} ${p.purchasePrice.toFixed(2)}`,
            `${businessConfig.currencySymbol} ${(p.currentStock * p.purchasePrice).toFixed(2)}`,
          ]);
        const totalValue = products
          .filter(p => p.type === 'producto')
          .reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
        return {
          title: 'Reporte 3: Valoración Total de Inventario y Stock Bajo',
          headers,
          rows,
          rawRows: products.filter(p => p.type === 'producto').map(p => [
            p.code,
            p.name,
            p.category,
            p.currentStock,
            p.unit,
            p.purchasePrice,
            p.currentStock * p.purchasePrice,
          ]),
          kpis: [
            { label: 'Valor en Bodega', value: `${businessConfig.currencySymbol} ${totalValue.toFixed(2)}` },
            {
              label: 'Productos en Alerta',
              value: products.filter(p => p.type === 'producto' && p.currentStock <= p.minStock).length.toString(),
            },
          ],
        };
      }

      case 4: {
        // Vencimiento de Lotes
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiringProds = products.filter(p => p.expirationDate);
        const headers = ['Código', 'Producto', 'Lote', 'Stock', 'Fecha Vencimiento', 'Diagnóstico'];
        const rows = expiringProds.map(p => {
          const exp = new Date(p.expirationDate!);
          const status = exp < now ? 'VENCIDO' : exp <= thirtyDays ? 'POR VENCER' : 'ÓPTIMO';
          return [
            p.code,
            p.name,
            p.lotNumber || 'S/L',
            `${p.currentStock} ${p.unit}`,
            p.expirationDate!,
            status,
          ];
        });
        return {
          title: 'Reporte 4: Semáforo de Vencimiento de Lotes',
          headers,
          rows,
          rawRows: rows,
          kpis: [
            { label: 'Lotes Auditados', value: expiringProds.length.toString() },
            {
              label: 'Vencidos / Críticos',
              value: expiringProds.filter(p => new Date(p.expirationDate!) <= thirtyDays).length.toString(),
            },
          ],
        };
      }

      case 5: {
        // Margen de Ganancia
        let totalIncome = 0;
        let totalCost = 0;
        sales.forEach(s => {
          totalIncome += s.subtotal;
          s.items.forEach(it => {
            totalCost += (it.costPrice || 0) * it.quantity;
          });
        });
        const grossProfit = totalIncome - totalCost;
        const marginPct = totalIncome > 0 ? (grossProfit / totalIncome) * 100 : 0;

        const headers = ['Factura', 'Fecha', 'Ventas (Subtotal)', 'Costo Mercancía', 'Utilidad', 'Margen %'];
        const rows = sales.map(s => {
          const c = s.items.reduce((acc, it) => acc + (it.costPrice || 0) * it.quantity, 0);
          const u = s.subtotal - c;
          const m = s.subtotal > 0 ? (u / s.subtotal) * 100 : 0;
          return [
            `${s.invoiceSeries}-${s.invoiceNumber}`,
            new Date(s.date).toLocaleDateString(),
            `${businessConfig.currencySymbol} ${s.subtotal.toFixed(2)}`,
            `${businessConfig.currencySymbol} ${c.toFixed(2)}`,
            `${businessConfig.currencySymbol} ${u.toFixed(2)}`,
            `${m.toFixed(1)}%`,
          ];
        });
        return {
          title: 'Reporte 5: Margen de Ganancia y Utilidad Bruta',
          headers,
          rows,
          rawRows: rows,
          kpis: [
            { label: 'Utilidad Bruta', value: `${businessConfig.currencySymbol} ${grossProfit.toFixed(2)}` },
            { label: 'Margen Promedio', value: `${marginPct.toFixed(1)}%` },
          ],
        };
      }

      case 6: {
        // Cuentas por Cobrar
        const rec = creditAccounts.filter(a => a.type === 'por_cobrar');
        const headers = ['Factura', 'Cliente', 'Emisión', 'Vencimiento', 'Total', 'Abonado', 'Saldo'];
        const rows = rec.map(a => [
          a.invoiceNumber,
          a.contactName,
          new Date(a.issueDate).toLocaleDateString(),
          new Date(a.dueDate).toLocaleDateString(),
          `${businessConfig.currencySymbol} ${a.totalAmount.toFixed(2)}`,
          `${businessConfig.currencySymbol} ${a.paidAmount.toFixed(2)}`,
          `${businessConfig.currencySymbol} ${(a.totalAmount - a.paidAmount).toFixed(2)}`,
        ]);
        const totalPending = rec.reduce((acc, a) => acc + (a.totalAmount - a.paidAmount), 0);
        return {
          title: 'Reporte 6: Antigüedad de Cuentas por Cobrar (Clientes)',
          headers,
          rows,
          rawRows: rec.map(a => [
            a.invoiceNumber,
            a.contactName,
            a.issueDate,
            a.dueDate,
            a.totalAmount,
            a.paidAmount,
            a.totalAmount - a.paidAmount,
          ]),
          kpis: [{ label: 'Por Cobrar', value: `${businessConfig.currencySymbol} ${totalPending.toFixed(2)}` }],
        };
      }

      case 7: {
        // Cuentas por Pagar
        const pay = creditAccounts.filter(a => a.type === 'por_pagar');
        const headers = ['Factura', 'Proveedor', 'Emisión', 'Vencimiento', 'Total', 'Abonado', 'Saldo'];
        const rows = pay.map(a => [
          a.invoiceNumber,
          a.contactName,
          new Date(a.issueDate).toLocaleDateString(),
          new Date(a.dueDate).toLocaleDateString(),
          `${businessConfig.currencySymbol} ${a.totalAmount.toFixed(2)}`,
          `${businessConfig.currencySymbol} ${a.paidAmount.toFixed(2)}`,
          `${businessConfig.currencySymbol} ${(a.totalAmount - a.paidAmount).toFixed(2)}`,
        ]);
        const totalPayable = pay.reduce((acc, a) => acc + (a.totalAmount - a.paidAmount), 0);
        return {
          title: 'Reporte 7: Cuentas por Pagar a Proveedores',
          headers,
          rows,
          rawRows: pay.map(a => [
            a.invoiceNumber,
            a.contactName,
            a.issueDate,
            a.dueDate,
            a.totalAmount,
            a.paidAmount,
            a.totalAmount - a.paidAmount,
          ]),
          kpis: [{ label: 'Por Pagar', value: `${businessConfig.currencySymbol} ${totalPayable.toFixed(2)}` }],
        };
      }

      case 8: {
        // Arqueos de Caja
        const headers = ['Código', 'Cajero', 'Apertura', 'Cierre', 'Fondo Inicial', 'Real Contado', 'Diferencia'];
        const rows = cashRegisters.map(r => [
          r.code,
          r.userName,
          new Date(r.openedAt).toLocaleTimeString(),
          r.closedAt ? new Date(r.closedAt).toLocaleTimeString() : 'ABIERTA',
          `${businessConfig.currencySymbol} ${r.initialCash.toFixed(2)}`,
          r.actualCashCounted !== undefined
            ? `${businessConfig.currencySymbol} ${r.actualCashCounted.toFixed(2)}`
            : '—',
          r.difference !== undefined ? `${businessConfig.currencySymbol} ${r.difference.toFixed(2)}` : '—',
        ]);
        return {
          title: 'Reporte 8: Histórico de Arqueos y Cierres de Caja Chica',
          headers,
          rows,
          rawRows: rows,
          kpis: [{ label: 'Turnos Registrados', value: cashRegisters.length.toString() }],
        };
      }

      case 9: {
        // Facturación Electrónica e IVA
        const totalVentasNetas = sales.reduce((acc, s) => acc + s.subtotal, 0);
        const totalIVA = sales.reduce((acc, s) => acc + s.taxTotal, 0);
        const headers = ['Factura', 'Fecha', 'Autorización Fiscal (CUFE)', 'Base Gravada', 'IVA 15%', 'Total'];
        const rows = sales.map(s => [
          `${s.invoiceSeries}-${s.invoiceNumber}`,
          new Date(s.date).toLocaleDateString(),
          s.electronicInvoice?.electronicAuthorization || 'AUT-DGI-ELEC',
          `${businessConfig.currencySymbol} ${s.subtotal.toFixed(2)}`,
          `${businessConfig.currencySymbol} ${s.taxTotal.toFixed(2)}`,
          `${businessConfig.currencySymbol} ${s.total.toFixed(2)}`,
        ]);
        return {
          title: 'Reporte 9: Liquidación de IVA Fiscal y Facturas Electrónicas',
          headers,
          rows,
          rawRows: rows,
          kpis: [
            { label: 'IVA Débito Fiscal', value: `${businessConfig.currencySymbol} ${totalIVA.toFixed(2)}` },
            { label: 'Base Imponible', value: `${businessConfig.currencySymbol} ${totalVentasNetas.toFixed(2)}` },
          ],
        };
      }

      case 10:
      default: {
        // Auditoría de Actividades
        const headers = ['Fecha / Hora', 'Producto', 'Tipo', 'Cantidad', 'Resultante', 'Usuario Auditor'];
        const rows = movements.map(m => [
          new Date(m.date).toLocaleString(),
          m.productName,
          m.type.toUpperCase(),
          m.quantity.toString(),
          m.resultingStock.toString(),
          m.userName,
        ]);
        return {
          title: 'Reporte 10: Auditoría de Actividades y Transacciones por Usuario',
          headers,
          rows,
          rawRows: rows,
          kpis: [{ label: 'Movimientos Totales Auditados', value: movements.length.toString() }],
        };
      }
    }
  };

  const currentReport = getReportData();

  const handleExportExcel = () => {
    ExcelExportService.exportToExcel(
      `Reporte_${selectedReportId}_${Date.now()}`,
      'Reporte',
      currentReport.headers,
      currentReport.rawRows
    );
  };

  const handleExportPdf = () => {
    PdfExportService.generateReportPdf(
      currentReport.title,
      `Generado el ${new Date().toLocaleString()} | Sistema FactuPro`,
      currentReport.headers,
      currentReport.rows,
      currentReport.kpis,
      businessConfig
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            10 Reportes Estratégicos & Fiscales
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exportación instantánea a PDF oficial con membrete y libros tabulares en Microsoft Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Descargar en Excel</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
          >
            <FileText className="h-4 w-4" />
            <span>Exportar Informe PDF</span>
          </button>
        </div>
      </div>

      {/* Grid of 10 Report Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
        {reportDefinitions.map(rep => {
          const Icon = rep.icon;
          const isSelected = selectedReportId === rep.id;

          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReportId(rep.id)}
              className={`flex flex-col text-left rounded-2xl p-3 border transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${rep.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">Reporte #{rep.id}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                {rep.title}
              </p>
              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{rep.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Report Preview & KPIs */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentReport.title}
            </h3>
            <p className="text-xs text-slate-400">
              Vista preliminar interactiva • {currentReport.rows.length} registros calculados
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentReport.kpis?.map((kpi, i) => (
              <div key={i} className="rounded-xl bg-slate-50 px-3 py-1.5 text-right dark:bg-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">{kpi.label}</span>
                <p className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Table Preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase font-bold text-slate-500 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  {currentReport.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentReport.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={currentReport.headers.length}
                      className="py-8 text-center text-slate-400"
                    >
                      No se encontraron datos para generar este reporte.
                    </td>
                  </tr>
                ) : (
                  currentReport.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
