import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { BusinessConfig, Sale, Product, InventoryMovement, CashRegister, CashMovement, Customer, Supplier, AuditLog } from '../../domain/types';

export class PdfExportService {
  // 1. FACTURA ELECTRÓNICA / TICKET EN PDF
  public static async generateInvoicePdf(sale: Sale, config: BusinessConfig): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [30, 41, 59]; // slate-800
    const accentColor = [14, 165, 233]; // sky-500

    // Header Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 12, 182, 38, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 12, 182, 38, 3, 3, 'S');

    // Business Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(config.name, 20, 22);

    // Business details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`RUC / Cédula: ${config.taxId} | Tel: ${config.phone}`, 20, 28);
    doc.text(`${config.address}, ${config.city}, ${config.country}`, 20, 33);
    doc.text(`Email: ${config.email}`, 20, 38);

    // Invoice badge
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(140, 16, 50, 28, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('FACTURA ELECTRÓNICA', 143, 23);
    doc.setFontSize(13);
    doc.text(`${sale.invoiceSeries}-${sale.invoiceNumber}`, 143, 30);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(sale.date).toLocaleDateString('es-NI')}`, 143, 36);
    doc.text(`Tipo: ${sale.isCredit ? 'CRÉDITO' : 'CONTADO'}`, 143, 40);

    // Customer & Payment Info
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 54, 182, 24, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('DATOS DEL CLIENTE:', 18, 61);
    doc.text('DATOS DE LA TRANSACCIÓN:', 110, 61);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Nombre: ${sale.customerName}`, 18, 67);
    doc.text(`Identificación: ${sale.customerIdentification || 'N/D'}`, 18, 72);

    doc.text(`Método de Pago: ${sale.paymentMethod.toUpperCase()}`, 110, 67);
    doc.text(`Atendido por: ${sale.userName}`, 110, 72);

    // Items Table
    const tableRows = sale.items.map(item => [
      item.code,
      item.name + (item.weightGrams ? ` (${(item.weightGrams / 1000).toFixed(2)} kg)` : ''),
      `${item.quantity} ${item.unit}`,
      `${config.currencySymbol} ${item.unitPrice.toFixed(2)}`,
      `${config.currencySymbol} ${item.discount.toFixed(2)}`,
      `${config.currencySymbol} ${item.total.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 82,
      head: [['Código', 'Descripción del Producto/Servicio', 'Cant.', 'Precio Unit.', 'Desc.', 'Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 74 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Totals box on right side
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, finalY, 76, 36, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(120, finalY, 76, 36, 2, 2, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal:', 124, finalY + 7);
    doc.text(`${config.currencySymbol} ${sale.subtotal.toFixed(2)}`, 190, finalY + 7, { align: 'right' });

    doc.text(`IVA (${config.taxRatePercent}%):`, 124, finalY + 14);
    doc.text(`${config.currencySymbol} ${sale.taxTotal.toFixed(2)}`, 190, finalY + 14, { align: 'right' });

    doc.text('Descuentos:', 124, finalY + 21);
    doc.text(`-${config.currencySymbol} ${sale.discountTotal.toFixed(2)}`, 190, finalY + 21, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL A PAGAR:', 124, finalY + 30);
    doc.text(`${config.currencySymbol} ${sale.total.toFixed(2)}`, 190, finalY + 30, { align: 'right' });

    // QR Code generation for Electronic Invoicing
    if (sale.electronicInvoice) {
      try {
        const qrDataUrl = await QRCode.toDataURL(sale.electronicInvoice.qrData, {
          width: 120,
          margin: 1,
        });
        doc.addImage(qrDataUrl, 'PNG', 16, finalY, 32, 32);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`CUFE: ${sale.electronicInvoice.cufe.substring(0, 32)}...`, 52, finalY + 8);
        doc.text(`CAE: ${sale.electronicInvoice.electronicAuthorization}`, 52, finalY + 13);
        doc.text(`Resolución DGI: ${config.resolutionNumber} (${config.resolutionDate})`, 52, finalY + 18);
        doc.text(`Firma Digital: ${sale.electronicInvoice.digitalSignature.substring(0, 24)}...`, 52, finalY + 23);
        doc.text('Verifique la validez de este documento escaneando el código QR fiscal.', 52, finalY + 28);
      } catch (err) {
        console.error('Error rendering QR in PDF', err);
      }
    }

    // Footer note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(config.invoiceFooterMessage, 105, 280, { align: 'center' });
    doc.text(`FactuPro • Desarrollado por Maxwell Chacón (Cédula: 2012904950006A) • Libre uso comercial`, 105, 285, { align: 'center' });

    doc.save(`Factura_${sale.invoiceSeries}_${sale.invoiceNumber}.pdf`);
  }

  // 2. GENERADOR UNIVERSAL PARA LOS 10 REPORTES
  public static generateReportPdf(
    title: string,
    subtitle: string,
    headers: string[],
    rows: (string | number)[][],
    summaryStats?: { label: string; value: string }[],
    config?: BusinessConfig
  ): void {
    const doc = new jsPDF({
      orientation: headers.length > 6 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const isLandscape = headers.length > 6;
    const pageWidth = isLandscape ? 297 : 210;

    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(config ? config.name : 'FactuPro Invoicing & Inventory Suite', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(title.toUpperCase(), 14, 18);

    doc.setFontSize(8);
    doc.text(`Generado: ${new Date().toLocaleString('es-NI')} • Usuario: Admin`, pageWidth - 14, 18, { align: 'right' });

    // Subtitle & Filter details
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(subtitle, 14, 34);

    let currentY = 38;

    // Summary cards if any
    if (summaryStats && summaryStats.length > 0) {
      const cardWidth = (pageWidth - 28) / Math.min(summaryStats.length, 4);
      summaryStats.slice(0, 4).forEach((stat, idx) => {
        const x = 14 + idx * cardWidth;
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(x, currentY, cardWidth - 4, 14, 2, 2, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(stat.label.toUpperCase(), x + 4, currentY + 5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(stat.value, x + 4, currentY + 11);
      });
      currentY += 18;
    }

    // Main Data Table
    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body: rows,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [51, 65, 85],
      },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${pageCount} • Sistema FactuPro • Autor: Maxwell Chacón (2012904950006A)`,
        pageWidth / 2,
        isLandscape ? 200 : 287,
        { align: 'center' }
      );
    }

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
