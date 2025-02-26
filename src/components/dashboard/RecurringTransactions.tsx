import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextDue: string;
  type: 'income' | 'expense';
  status: 'active' | 'paused';
}

const RecurringTransactions: React.FC = () => {
  const transactions: RecurringTransaction[] = [
    {
      id: '1',
      description: 'Office Rent',
      amount: 5000,
      frequency: 'monthly',
      nextDue: '2024-04-01',
      type: 'expense',
      status: 'active',
    },
    {
      id: '2',
      description: 'Software Subscription',
      amount: 1200,
      frequency: 'monthly',
      nextDue: '2024-04-05',
      type: 'expense',
      status: 'active',
    },
    {
      id: '3',
      description: 'Consulting Retainer',
      amount: 15000,
      frequency: 'monthly',
      nextDue: '2024-04-01',
      type: 'income',
      status: 'active',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recurring Transactions</h2>
          <button className="text-sm text-emerald-600 hover:text-emerald-700">
            Add New
          </button>
        </div>

        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{transaction.description}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₵{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Next: {new Date(transaction.nextDue).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <div className="flex items-center gap-1">
                  {transaction.status === 'active' ? (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      Paused
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-500 hover:text-gray-700">Edit</button>
                  <button className="text-gray-500 hover:text-gray-700">Skip Next</button>
                  <button className="text-gray-500 hover:text-gray-700">Pause</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecurringTransactions;