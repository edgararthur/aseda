import React from 'react';

export const QuickActions = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="flex flex-col space-y-2">
        <button className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Create Journal Entry</button>
        <button className="bg-green-500 text-white py-2 rounded hover:bg-green-600">Record Payment</button>
        <button className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">Generate Report</button>
        <button className="bg-purple-500 text-white py-2 rounded hover:bg-purple-600">Add Vendor/Customer</button>
      </div>
    </div>
  );
}; 