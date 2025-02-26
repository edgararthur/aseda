import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash, Send, Printer } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  amount: number;
  status: string;
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [newInvoice, setNewInvoice] = useState<Invoice>({ id: 0, invoiceNumber: '', clientName: '', dueDate: '', amount: 0, status: 'Unpaid' });

  const handleAddInvoice = () => {
    setInvoices([...invoices, { ...newInvoice, id: invoices.length + 1 }]);
    setNewInvoice({ id: 0, invoiceNumber: '', clientName: '', dueDate: '', amount: 0, status: 'Unpaid' });
    toast.success('Invoice added successfully!');
  };

  const handleDeleteInvoice = (id: number) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
    toast.error('Invoice deleted successfully!');
  };

  const handleSendInvoice = (id: number) => {
    toast.success(`Invoice ${id} sent!`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Add New Invoice</h2>
        <input type="text" placeholder="Invoice Number" value={newInvoice.invoiceNumber} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} />
        <input type="text" placeholder="Client Name" value={newInvoice.clientName} onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })} />
        <input type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} />
        <input type="number" placeholder="Amount" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) })} />
        <button onClick={handleAddInvoice} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-1">
          <Plus size={16} /> Add Invoice
        </button>
      </div>

      <table className="min-w-full bg-white rounded-lg">
        <thead className='text-gray-700 text-sm'>
          <tr>
            <th className='py-2 px-4 border-b'>Invoice Number</th>
            <th className="py-2 px-4 border-b">Client Name</th>
            <th className="py-2 px-4 border-b">Due Date</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className='text-center text-gray-500 text-sm font-normal'>
              <td className='py-2 px-4 border-b'>{invoice.invoiceNumber}</td>
              <td className="py-2 px-4 border-b">{invoice.clientName}</td>
              <td className="py-2 px-4 border-b">{invoice.dueDate}</td>
              <td className="py-2 px-4 border-b">{invoice.amount}</td>
              <td className="py-2 px-4 border-b">{invoice.status}</td>
              <td className="py-2 px-4 border-b">
                <button onClick={() => handleSendInvoice(invoice.id)} className="text-green-500 hover:text-green-700 mr-2">
                  <Printer size={16} />
                </button>
                <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-500 hover:text-red-700">
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 