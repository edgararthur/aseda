import React from 'react';
import { Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TaxSummaryProps {
  taxCollected: number;
  taxPaid: number;
  netLiability: number;
  nextFilingDate: string;
}

const TaxSummary: React.FC<TaxSummaryProps> = ({
  taxCollected,
  taxPaid,
  netLiability,
  nextFilingDate,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Tax Summary</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Next Filing Due:</span>
          <span className="text-sm font-medium">{nextFilingDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Receipt className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm">+2.5%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-600">Tax Collected</h3>
          <p className="text-xl font-semibold mt-1">
            ₵{taxCollected.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Receipt className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex items-center text-red-600">
              <ArrowDownRight className="h-4 w-4" />
              <span className="text-sm">-1.8%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-600">Tax Paid</h3>
          <p className="text-xl font-semibold mt-1">
            ₵{taxPaid.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center text-blue-600">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm">+0.7%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-600">Net Tax Liability</h3>
          <p className="text-xl font-semibold mt-1">
            ₵{netLiability.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Recent Tax Payments</h3>
          <button className="text-sm text-emerald-600 hover:text-emerald-700">
            View All
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">VAT Payment</p>
              <p className="text-xs text-gray-500">February 2024</p>
            </div>
            <span className="text-sm font-medium">₵12,450.00</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Corporate Tax</p>
              <p className="text-xs text-gray-500">Q1 2024</p>
            </div>
            <span className="text-sm font-medium">₵28,750.00</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Withholding Tax</p>
              <p className="text-xs text-gray-500">March 2024</p>
            </div>
            <span className="text-sm font-medium">₵5,320.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxSummary;