import React from 'react';
import { FileText, MoreVertical, AlertCircle } from 'lucide-react';
import type { Invoice } from '../../types/index';

interface Props {
  invoices: Invoice[];
  onViewInvoice?: (invoice: Invoice) => void;
}

const InvoiceList: React.FC<Props> = ({ invoices, onViewInvoice }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Invoices</h2>
          <button className="text-sm text-emerald-600 hover:text-emerald-700">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => onViewInvoice?.(invoice)}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">#{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">Due {invoice.dueDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-right font-medium">
                    ₵{invoice.total.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    {invoice.status === 'overdue' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full \${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : invoice.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;