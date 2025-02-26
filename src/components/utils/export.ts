/* eslint-disable @typescript-eslint/no-explicit-any */
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ColumnDef } from '@tanstack/react-table';

export function exportToExcel<T>(data: T[], title: string) {
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, title);
  writeFile(workbook, `${title}.xlsx`);
}

export function exportToPDF<T>(data: T[], columns: ColumnDef<T, unknown>[], fileName: string, title: string) {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Prepare data for autoTable
    const headers = columns.map((col) => 
      typeof col.header === 'string' ? col.header : col.id
    );
    
    const rows = data.map((item) =>
      columns.map((col) => {
        const value = item[col.id as keyof T];
        return value !== null && value !== undefined ? String(value) : '';
      })
    );
  
    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
    });
  
    // Save PDF
    doc.save(`${title}.pdf`);
}

export function printTable<T>(data: T[], columns: ColumnDef<T, any>[], title: string) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Generate table HTML
  const headers = columns.map((col) => 
    typeof col.header === 'string' ? col.header : col.id
  );
  
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col.id as keyof T];
      return value !== null && value !== undefined ? String(value) : '';
    })
  );

  // Create print-friendly styles
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
      th { background-color: #f5f5f5; }
      h1 { margin-bottom: 20px; }
      @media print {
        body { margin: 0; padding: 20px; }
      }
    </style>
  `;

  // Generate HTML content
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${styles}
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              ${headers.map((header) => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                ${row.map((cell) => `<td>${cell}</td>`).join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Write content and print
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
  };
}