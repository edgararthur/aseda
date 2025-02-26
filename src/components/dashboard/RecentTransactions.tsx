import React from 'react';

export const RecentTransactions = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">Date</th>
            <th className="py-2 px-4 text-left">Description</th>
            <th className="py-2 px-4 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b py-2 px-4">01/01/2023</td>
            <td className="border-b py-2 px-4">Payment Received</td>
            <td className="border-b py-2 px-4 text-green-600">$1,000</td>
          </tr>
          <tr>
            <td className="border-b py-2 px-4">01/02/2023</td>
            <td className="border-b py-2 px-4">Invoice Paid</td>
            <td className="border-b py-2 px-4 text-red-600">-$500</td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </table>
    </div>
  );
}; 