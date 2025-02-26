// src/components/tax/TaxManagment.tsx
import React, { useState } from 'react';
import { AlertCircle, Clock, Bell } from 'lucide-react';
import DataTable from '../layout/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { exportToExcel, exportToPDF } from '../utils/export';
import { Sidebar } from '../layout/Sidebar';

interface TaxFiling {
  id: string;
  type: 'Income Tax' | 'VAT' | 'Withholding Tax';
  period: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'filed' | 'overdue' | 'paid';
  reference?: string;
  filedDate?: string;
}

interface VATEntry {
  id: string;
  period: string;
  salesVAT: number;
  purchaseVAT: number;
  netVAT: number;
  status: 'pending' | 'filed' | 'paid';
  dueDate: string;
  filedDate?: string;
}

interface IncomeTaxEntry {
  id: string;
  year: string;
  quarter: string;
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  taxAmount: number;
  status: 'pending' | 'filed' | 'paid';
  dueDate: string;
  filedDate?: string;
}

export default function TaxManagement() {
  const [activeTab, setActiveTab] = useState<'filings' | 'vat' | 'income'>('filings');

  // Sample data
  const taxFilings: TaxFiling[] = [
    {
      id: '1',
      type: 'VAT',
      period: 'March 2024',
      dueDate: '2024-04-15',
      amount: 45875,
      status: 'pending',
    },
    {
      id: '2',
      type: 'Income Tax',
      period: 'Q1 2024',
      dueDate: '2024-04-30',
      amount: 125000,
      status: 'pending',
    },
    {
      id: '3',
      type: 'Withholding Tax',
      period: 'March 2024',
      dueDate: '2024-04-15',
      amount: 12500,
      status: 'filed',
      reference: 'WHT-2024-03',
      filedDate: '2024-04-10',
    },
  ];

  const vatEntries: VATEntry[] = [
    {
      id: '1',
      period: 'March 2024',
      salesVAT: 75000,
      purchaseVAT: 45000,
      netVAT: 30000,
      status: 'pending',
      dueDate: '2024-04-15',
    },
    {
      id: '2',
      period: 'February 2024',
      salesVAT: 68000,
      purchaseVAT: 42000,
      netVAT: 26000,
      status: 'paid',
      dueDate: '2024-03-15',
      filedDate: '2024-03-14',
    },
  ];

  const incomeTaxEntries: IncomeTaxEntry[] = [
    {
      id: '1',
      year: '2024',
      quarter: 'Q1',
      grossIncome: 1250000,
      deductions: 350000,
      taxableIncome: 900000,
      taxAmount: 225000,
      status: 'pending',
      dueDate: '2024-04-30',
    },
    {
      id: '2',
      year: '2023',
      quarter: 'Q4',
      grossIncome: 1150000,
      deductions: 320000,
      taxableIncome: 830000,
      taxAmount: 207500,
      status: 'paid',
      dueDate: '2024-01-31',
      filedDate: '2024-01-25',
    },
  ];

  const filingColumns: ColumnDef<TaxFiling>[] = [
    { accessorKey: 'type', header: 'Tax Type' },
    { accessorKey: 'period', header: 'Period' },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: info => new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            info.getValue() === 'paid'
              ? 'bg-green-100 text-green-800'
              : info.getValue() === 'filed'
              ? 'bg-blue-100 text-blue-800'
              : info.getValue() === 'overdue'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {(info.getValue() as string).charAt(0).toUpperCase() +
            (info.getValue() as string).slice(1)}
        </span>
      ),
    },
    { accessorKey: 'reference', header: 'Reference' },
    {
      accessorKey: 'filedDate',
      header: 'Filed Date',
      cell: info =>
        info.getValue()
          ? new Date(info.getValue() as string).toLocaleDateString()
          : '-',
    },
  ];

  const vatColumns: ColumnDef<VATEntry>[] = [
    { accessorKey: 'period', header: 'Period' },
    {
      accessorKey: 'salesVAT',
      header: 'Sales VAT',
      cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'purchaseVAT',
      header: 'Purchase VAT',
      cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'netVAT',
      header: 'Net VAT',
      cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: info => new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            info.getValue() === 'paid'
              ? 'bg-green-100 text-green-800'
              : info.getValue() === 'filed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {(info.getValue() as string).charAt(0).toUpperCase() +
            (info.getValue() as string).slice(1)}
        </span>
      ),
    },
  ];

  const incomeTaxColumns: ColumnDef<IncomeTaxEntry>[] = [
    { accessorKey: 'year', header: 'Year' },
    { accessorKey: 'quarter', header: 'Quarter' },
    {
      accessorKey: 'grossIncome',
      header: 'Gross Income',
      cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'deductions',
      header: 'Deductions',
      cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'taxableIncome',
      header: 'Taxable Income',
      cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'taxAmount',
      header: 'Tax Amount',
      cell: info => `₵${(info.getValue() as number).toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            info.getValue() === 'paid'
              ? 'bg-green-100 text-green-800'
              : info.getValue() === 'filed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {(info.getValue() as string).charAt(0).toUpperCase() +
            (info.getValue() as string).slice(1)}
        </span>
      ),
    },
  ];

  // Update PDF export to expect three arguments.
  const handleExportExcel = (data: unknown[], filename: string) => {
    exportToExcel(data, filename);
  };

  const handleExportPDF = (
    data: unknown[],
    columns: { header: string; accessor: string }[],
    filename: string,
	title: string
  ) => {
    exportToPDF(data, columns, filename, title);
  };

  return (
    <div className="flex w-dvw h-full bg-blue-50 font-poppins">
      <Sidebar />
      <main className="w-full bg-faded flex-1 bg-blue-50">
        <div className="max-w-8xl">
          <header className="bg-white shadow-md mb-4">
            <div className="flex items-center justify-end px-8 py-3">
              <div className="flex items-center gap-4">
                <button className="relative p-2 bg-transparent text-gray-400 hover:text-gray-600">
                  <Bell size={19} className="bg-transparent" />
                  <span className="absolute top-1 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-3 cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <p className="text-xs font-medium">Kwame Mensah</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="overflow-y-auto px-4">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
              <h2 className="text-sm font-semibold mb-4">Upcoming Tax Deadlines</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {taxFilings
                  .filter(filing => filing.status === 'pending')
                  .slice(0, 3)
                  .map(filing => (
                    <div
                      key={filing.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-poppins font-medium">
                            {filing.type}
                          </span>
                        </div>
                        {new Date(filing.dueDate) < new Date() && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{filing.period}</p>
                      <p className="text-sm font-medium mt-1">
                        Due: {new Date(filing.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        ₵{filing.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tax Management Tabs */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b">
                <div className="flex space-x-8 px-6 py-5">
                  <button
                    className={`py-3 px-2 -mb-px text-xs font-semibold font-poppins ${
                      activeTab === 'filings'
                        ? 'border-b-2 bg-blue-400 outline-none border-none text-white'
                        : 'text-white'
                    }`}
                    onClick={() => setActiveTab('filings')}
                  >
                    Tax Filings
                  </button>
                  <button
                    className={`py-3 px-2 -mb-px text-xs font-semibold font-poppins ${
                      activeTab === 'vat'
                        ? 'border-b-2 bg-blue-400 outline-none border-none text-white'
                        : 'text-white'
                    }`}
                    onClick={() => setActiveTab('vat')}
                  >
                    VAT Management
                  </button>
                  <button
                    className={`py-3 px-2 -mb-px text-xs font-semibold font-poppins ${
                      activeTab === 'income'
                        ? 'border-b-2 bg-blue-400 outline-none border-none text-white'
                        : 'text-white'
                    }`}
                    onClick={() => setActiveTab('income')}
                  >
                    Income Tax
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'filings' && (
                  <DataTable<TaxFiling>
                    data={taxFilings}
                    columns={filingColumns}
					title="Tax Filings"
                    handleExportExcel={(data: unknown[]) => handleExportExcel(data, 'tax-filings')}
                    handleExportPDF={(data: unknown[], columns: { header: string; accessor: string; }[]) =>
						handleExportPDF(
						  data,
						  columns,
						  'tax-filings',
						  'Tax Filings Report'
						)
					}
                  />
                )}

                {activeTab === 'vat' && (
                  <DataTable<VATEntry>
                    data={vatEntries}
                    columns={vatColumns}
					title="VAT"
                    handleExportExcel={(data: unknown[]) => handleExportExcel(data, 'vat-entries')}
					handleExportPDF={(data: unknown[], columns: { header: string; accessor: string; }[]) =>
						handleExportPDF(
						data,
						columns,
						'vat-entries',
						'VAT Entries Report'
						)
					}
                  />
                )}

                {activeTab === 'income' && (
                  <DataTable<IncomeTaxEntry>
                    data={incomeTaxEntries}
                    columns={incomeTaxColumns}
					title="Income Tax"
                    handleExportExcel={(data: unknown[]) => handleExportExcel(data, 'income-tax')}
					handleExportPDF={(data: unknown[], columns: { header: string; accessor: string; }[]) =>
						handleExportPDF(
						data,
						columns,
						'income-tax',
						'Income Tax Report'
						)
					}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

