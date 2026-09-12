import * as XLSX from 'xlsx';

export class ExcelExportService {
  public static exportToExcel(
    fileName: string,
    sheetName: string,
    headers: string[],
    rows: (string | number)[][]
  ): void {
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto calculate column widths
    const colWidths = headers.map((header, i) => {
      let maxLen = header.length;
      rows.forEach(r => {
        const val = r[i];
        if (val !== undefined && val !== null) {
          maxLen = Math.max(maxLen, String(val).length);
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

    XLSX.writeFile(wb, `${fileName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
