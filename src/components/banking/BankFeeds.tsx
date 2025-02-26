import React from 'react';
import { Ban as Bank, RefreshCw, Link2, AlertCircle, Landmark } from 'lucide-react';

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  lastSync: string;
  status: 'active' | 'error' | 'disconnected';
}

const BankFeeds: React.FC = () => {
  const bankAccounts: BankAccount[] = [
    {
      id: '1',
      name: 'GCB Business Account',
      accountNumber: '****1234',
      balance: 275000,
      lastSync: '2024-03-15T10:30:00Z',
      status: 'active',
    },
    {
      id: '2',
      name: 'Ecobank Savings',
      accountNumber: '****5678',
      balance: 125000,
      lastSync: '2024-03-15T10:30:00Z',
      status: 'error',
    },
  ];

  return (
    <div className="bg-white text-gray-800 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold">Bank Feeds</h2>
          <button className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 bg-transparent border-none">
            <Link2 className="h-4 w-4" />
            <span>Connect Bank</span>
          </button>
        </div>

        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Landmark className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{account.name}</h3>
                    <p className="text-sm text-gray-500">Acc: {account.accountNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₵{account.balance.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-sm">
                    {account.status == 'active' ? (
                      <>
                        <RefreshCw className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 text-xs">Synced</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-red-500 text-xs">Sync Error</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 text-xs">
                  Last synced: {new Date(account.lastSync).toLocaleString()}
                </span>
                <button className="text-emerald-600 bg-gray-200 hover:text-emerald-700 text-xs">
                  View Transactions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BankFeeds;