import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash, Download } from 'lucide-react';

interface JournalEntry {
  id: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  accountType: string;
}

export function GeneralLedger() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState<JournalEntry>({ id: 0, date: '', description: '', debit: 0, credit: 0, accountType: '' });

  const handleAddEntry = () => {
    if (newEntry.debit !== newEntry.credit) {
      toast.error('Total debits must equal total credits.');
      return;
    }
    setEntries([...entries, { ...newEntry, id: entries.length + 1 }]);
    setNewEntry({ id: 0, date: '', description: '', debit: 0, credit: 0, accountType: '' });
    toast.success('Journal entry added successfully!');
  };

  const handleDeleteEntry = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
    toast.error('Journal entry deleted successfully!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">General Ledger</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Add New Entry</h2>
        <input type="date" value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} />
        <input type="text" placeholder="Description" value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
        <input type="number" placeholder="Debit" value={newEntry.debit} onChange={(e) => setNewEntry({ ...newEntry, debit: parseFloat(e.target.value) })} />
        <input type="number" placeholder="Credit" value={newEntry.credit} onChange={(e) => setNewEntry({ ...newEntry, credit: parseFloat(e.target.value) })} />
        <input type="text" placeholder="Account Type" value={newEntry.accountType} onChange={(e) => setNewEntry({ ...newEntry, accountType: e.target.value })} />
        <button onClick={handleAddEntry} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-1">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <table className="min-w-full bg-white rounded-lg">
        <thead className='text-gray-700 text-sm'>
          <tr>
            <th className='py-2 px-4 border-b'>Date</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Debit</th>
            <th className="py-2 px-4 border-b">Credit</th>
            <th className="py-2 px-4 border-b">Account Type</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className='text-center text-gray-500 text-sm font-normal'>
              <td className='py-2 px-4 border-b'>{entry.date}</td>
              <td className="py-2 px-4 border-b">{entry.description}</td>
              <td className="py-2 px-4 border-b">{entry.debit}</td>
              <td className="py-2 px-4 border-b">{entry.credit}</td>
              <td className="py-2 px-4 border-b">{entry.accountType}</td>
              <td className="py-2 px-4 border-b">
                <button onClick={() => handleDeleteEntry(entry.id)} className="text-red-500 hover:text-red-700">
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