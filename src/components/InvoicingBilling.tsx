import React, { useState } from 'react';
import { Plus, Edit, Trash, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sidebar } from './layout/Sidebar';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  amount: number;
  status: string;
  recurring: boolean;
}

export default function InvoicingBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [newInvoice, setNewInvoice] = useState<Invoice>({
    id: 0,
    invoiceNumber: '',
    clientName: '',
    dueDate: '',
    amount: 0,
    status: 'Unpaid',
    recurring: false,
  });

  const handleAddInvoice = () => {
    setInvoices([...invoices, { ...newInvoice, id: invoices.length + 1 }]);
    setNewInvoice({ id: 0, invoiceNumber: '', clientName: '', dueDate: '', amount: 0, status: 'Unpaid', recurring: false });
    toast.success('Invoice added successfully!');
  };

  const handleDeleteInvoice = (id: number) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
    toast.error('Invoice deleted successfully!');
  };

  const handleSendInvoice = (id: number) => {
    toast.success(`Invoice ${id} sent!`);
  };

  const handleEditInvoice = (id: number) => {
    const invoiceToEdit = invoices.find(invoice => invoice.id === id);
    if (invoiceToEdit) {
      setNewInvoice(invoiceToEdit);
    }
  };

  return (
    <div className="flex w-screen h-screen bg-gray-100">
      <Sidebar />
      <main className="w-full bg-faded flex-1 p-6">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-700">Invoicing & Billing</h1>
          <button onClick={handleAddInvoice} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-1">
            <Plus size={16} /> Add New Invoice
          </button>
        </header>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Create New Invoice</h2>
          <input
            type="text"
            placeholder="Invoice Number"
            value={newInvoice.invoiceNumber}
            onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Client Name"
            value={newInvoice.clientName}
            onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="date"
            value={newInvoice.dueDate}
            onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newInvoice.amount}
            onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) })}
            className="border p-2 rounded w-full mb-2"
          />
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={newInvoice.recurring}
              onChange={(e) => setNewInvoice({ ...newInvoice, recurring: e.target.checked })}
              className="mr-2"
            />
            Recurring Invoice
          </label>
        </div>

        <button onClick={handleAddInvoice} className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Invoice
        </button>

        <table className="min-w-full bg-white rounded-lg mt-6">
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
                <td className='py-2 px-4 border-b'>{invoice.clientName}</td>
                <td className="py-2 px-4 border-b">{invoice.dueDate}</td>
                <td className="py-2 px-4 border-b">GHS {invoice.amount.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-white ${invoice.status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-2 px-2 border-b">
                  <button onClick={() => handleEditInvoice(invoice.id)} className="text-blue-500 bg-white hover:text-blue-700 mr-2">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleSendInvoice(invoice.id)} className="text-green-500 bg-white hover:text-green-700 mr-2">
                    <Send size={16} />
                  </button>
                  <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-500 bg-white hover:text-red-700">
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
} 