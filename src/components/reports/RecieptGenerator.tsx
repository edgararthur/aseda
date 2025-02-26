/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Printer, Download, X } from 'lucide-react';
import type { Transaction } from '../../types/index';
// import exportToPDF from '../utils/export';
import jsPDF from 'jspdf';

interface Props {
  transaction: Transaction;
  onClose: () => void;
}

const ReceiptGenerator: React.FC<Props> = ({ transaction, onClose }) => {
  const [copies, setCopies] = useState(1);
  const receiptNumber = `RCP-${format(new Date(), 'yyyyMMdd')}-${transaction.id}`;

  const generateReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Company Header
    doc.setFontSize(20);
    doc.text('GH Finance', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('123 Business Avenue, Accra, Ghana', pageWidth / 2, 30, { align: 'center' });
    doc.text('Tel: +233 123 456 789', pageWidth / 2, 35, { align: 'center' });
    doc.text('Email: info@ghfinance.com', pageWidth / 2, 40, { align: 'center' });
    
    // Receipt Details
    doc.setFontSize(16);
    doc.text('RECEIPT', pageWidth / 2, 55, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Receipt No: ${receiptNumber}`, 15, 70);
    doc.text(`Date: ${format(new Date(transaction.date), 'dd/MM/yyyy')}`, 15, 77);
    doc.text(`Reference: ${transaction.reference}`, 15, 84);
    
    // Transaction Details
    doc.line(15, 90, pageWidth - 15, 90);
    doc.text('Description', 15, 100);
    doc.text('Amount', pageWidth - 50, 100);
    
    doc.text(transaction.description, 15, 110);
    doc.text(`₵${transaction.amount.toLocaleString()}`, pageWidth - 50, 110);
    
    // Tax Details if applicable
    if (transaction.taxable) {
      doc.text('Tax Rate', 15, 120);
      doc.text(`${transaction.taxRate}%`, pageWidth - 50, 120);
      doc.text('Tax Amount', 15, 127);
      doc.text(`₵${transaction.taxAmount?.toLocaleString()}`, pageWidth - 50, 127);
    }
    
    // Total
    doc.line(15, 135, pageWidth - 15, 135);
    doc.setFontSize(12);
    doc.text('Total Amount:', 15, 145);
    doc.text(`₵${transaction.amount.toLocaleString()}`, pageWidth - 50, 145);
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for your business', pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    // Save or print based on copies
    for (let i = 0; i < copies; i++) {
      if (i === 0) {
        doc.save(`${receiptNumber}.pdf`);
      } else {
        doc.autoPrint();
        doc.output('dataurlnewwindow');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Generate Receipt</h2>
          <button
            onClick={onClose}
            className="text-red-600 bg-transparent border-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium">Receipt Preview</h3>
              <div className="mt-2 p-4 border rounded-lg">
                <div className="text-center mb-4">
                  <h4 className="text-xl font-semibold text-gray-800">Aseda Accounting</h4>
                  <p className="text-sm text-gray-600">123 Business Avenue, Accra</p>
                  <p className="text-sm text-gray-600">Tel: +233 *** ** ***</p>
                </div>
                
                <div className="space-y-2 text-sm font-medium text-gray-800">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt No:</span>
                    <span>{receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{format(new Date(transaction.date), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span>{transaction.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span>₵{transaction.amount.toLocaleString()}</span>
                  </div>
                  {transaction.taxable && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Rate:</span>
                        <span>{transaction.taxRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Amount:</span>
                        <span>₵{transaction.taxAmount?.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₵{transaction.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Copies
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={generateReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              <Download className="h-4 w-4" />
              <span className='text-xs'>Generate Receipt</span>
            </button>
            <button
              onClick={() => {
                generateReceipt();
                window.print();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Printer className="h-4 w-4" />
              <span className='text-xs'>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;