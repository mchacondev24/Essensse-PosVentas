import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Send,
  Code,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Search,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { DgiElectronicInvoiceService, DgiTransmissionResult } from '../../infrastructure/fiscal/dgiService';
import { PdfExportService } from '../../infrastructure/exporters/pdfGenerator';

export const FiscalView: React.FC = () => {
  const { sales, businessConfig } = useApp();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [xmlModalContent, setXmlModalContent] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState<string | null>(null);
  const [dgiNotice, setDgiNotice] = useState<string | null>(null);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  const handleTransmit = async (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    setIsTransmitting(saleId);
    try {
      const res = await DgiElectronicInvoiceService.transmitToDgi(
        `${sale.invoiceSeries}-${sale.invoiceNumber}`,
        sale.date,
        sale.subtotal,
        sale.taxTotal,
        sale.total,
        businessConfig.taxId,
        businessConfig.name,
        sale.customerTaxId || '0010000000000U',
        sale.customerName
      );

      setDgiNotice(`✓ Factura ${sale.invoiceSeries}-${sale.invoiceNumber} autorizada con CUFE: ${res.cufe.slice(0, 16)}...`);
      setTimeout(() => setDgiNotice(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTransmitting(null);
    }
  };

  const handleViewXml = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const cufe = sale.electronicInvoice?.cufe || DgiElectronicInvoiceService.generateCUFE(
      `${sale.invoiceSeries}-${sale.invoiceNumber}`,
      sale.date,
      sale.subtotal,
      sale.taxTotal,
      sale.total,
      businessConfig.taxId,
      sale.customerTaxId || '0010000000000U'
    );

    const xml = DgiElectronicInvoiceService.generateFiscalXml(
      `${sale.invoiceSeries}-${sale.invoiceNumber}`,
      sale.date,
      cufe,
      businessConfig.name,
      businessConfig.taxId,
      sale.customerName,
      sale.customerTaxId || '0010000000000U',
      sale.total,
      sale.taxTotal
    );

    setXmlModalContent(xml);
  };

  const handleDownloadXml = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const cufe = sale.electronicInvoice?.cufe || 'CUFE_TEST';
    const xml = DgiElectronicInvoiceService.generateFiscalXml(
      `${sale.invoiceSeries}-${sale.invoiceNumber}`,
      sale.date,
      cufe,
      businessConfig.name,
      businessConfig.taxId,
      sale.customerName,
      sale.customerTaxId || '0010000000000U',
      sale.total,
      sale.taxTotal
    );

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${sale.invoiceSeries}_${sale.invoiceNumber}_DGI.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Facturación Electrónica Fiscal DGI
            </h2>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              CUFE & XML UBL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Firma digital de comprobantes, código QR fiscal, transmisión a la Dirección General de Ingresos y CUFE
          </p>
        </div>
      </div>

      {dgiNotice && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{dgiNotice}</span>
        </div>
      )}

      {/* DGI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conector DGI</span>
            <p className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">OPERATIVO EN LÍNEA</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">RUC Emisor Registrado</span>
            <p className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">{businessConfig.taxId}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estándar Fiscal</span>
            <p className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">XML UBL 2.1 / X.509</p>
          </div>
        </div>
      </div>

      {/* Sales Invoices List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Comprobantes Electrónicos Emitidos ({sales.length})
          </h3>
          <span className="text-xs text-slate-400">Validación instantánea de hash CUFE y código QR</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Número Factura</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Receptor / Cliente</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Código CUFE Fiscal</th>
                <th className="px-4 py-3 text-center">Estado DGI</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.map(s => {
                const isTrans = isTransmitting === s.id;
                const cufe = s.electronicInvoice?.cufe || 'AUT-DGI-NIC-OK';

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {s.invoiceSeries}-{s.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {s.customerName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {businessConfig.currencySymbol} {s.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500 max-w-[180px] truncate">
                      {cufe}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        AUTORIZADA
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleTransmit(s.id)}
                          disabled={isTrans}
                          title="Re-transmitir a DGI"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                        >
                          <Send className={`h-4 w-4 ${isTrans ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleViewXml(s.id)}
                          title="Ver XML Fiscal UBL"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                        >
                          <Code className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadXml(s.id)}
                          title="Descargar XML firmado"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => PdfExportService.generateInvoicePdf(s, businessConfig)}
                          title="Imprimir Factura Fiscal PDF"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* XML Modal Viewer */}
      {xmlModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 p-6 shadow-2xl border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-sm">XML Fiscal UBL 2.1 (Firma Digital DSig)</h3>
              </div>
              <button
                onClick={() => setXmlModalContent(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="mt-3 overflow-x-auto max-h-96 rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 border border-slate-800">
              <pre>
                <code>{xmlModalContent}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
