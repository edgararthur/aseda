/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { TransactionFormData, TransactionCategory } from '../../types';

interface Props {
  onSubmit: (data: TransactionFormData) => void;
  onClose: () => void;
  initialData?: Partial<TransactionFormData>;
}

const CATEGORIES: TransactionCategory[] = [
  'Sales',
  'Services',
  'Utilities',
  'Rent',
  'Salaries',
  'Operations',
  'Marketing',
  'Insurance',
  'Taxes',
];

const TransactionForm: React.FC<Props> = ({ onSubmit, onClose, initialData }) => {
  // const [formData, setFormData] = useState<TransactionFormData>({
  //   date: initialData?.date || new Date().toISOString().split('T')[0],
  //   description: initialData?.description || '',
  //   amount: initialData?.amount || 0,
  //   type: initialData?.type || 'expense',
  //   category: initialData?.category || 'Operations',
  //   paymentMethod: initialData?.paymentMethod || 'cash',
  //   reference: initialData?.reference || '',
  //   notes: initialData?.notes || '',
  // });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // const validateForm = (): boolean => {
  //   const newErrors: Record<string, string> = {};

  //   if (!formData.description.trim()) {
  //     newErrors.description = 'Description is required';
  //   }

  //   if (formData.amount <= 0) {
  //     newErrors.amount = 'Amount must be greater than 0';
  //   }

  //   if (!formData.date) {
  //     newErrors.date = 'Date is required';
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (validateForm()) {
  //     onSubmit(formData);
  //   }
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`pl-10 pr-4 py-2 w-full border ${
                    errors.date
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent\`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₵)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`pl-10 pr-4 py-2 w-full border ${
                    errors.amount
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className={`pl-10 pr-4 py-2 w-full border \${
                    errors.description
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'income' | 'expense',
                  })
                }
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as TransactionCategory,
                  })
                }
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as 'cash' | 'bank' | 'mobile_money',
                  })
                }
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-emerald-500 rounded-lg hover:bg-emerald-600"
            >
              {initialData ? 'Update' : 'Create'} Transaction
            </button>
          </div>
        </form> */}
      </div>
    </div>
  );
};

export default TransactionForm;