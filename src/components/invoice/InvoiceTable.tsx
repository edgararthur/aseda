import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import DataTable from './../layout/DataTable';
import type { Invoice } from '../../types';

const columnHelper = createColumnHelper<Invoice>();

const columns = [
  columnHelper.accessor('invoiceNumber', {
    header: 'Invoice #',
  }),
  columnHelper.accessor('date', {
    header: 'Date',
  }),
  columnHelper.accessor('dueDate', {
    header: 'Due Date',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          info.getValue() === 'paid'
            ? 'bg-green-100 text-green-800'
            : info.getValue() === 'overdue'
            ? 'bg-red-100 text-red-800'
            : info.getValue() === 'sent'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
      </span>
    ),
  }),
  columnHelper.accessor('total', {
    header: 'Total',
    cell: (info) => <span>₵{info.getValue().toLocaleString()}</span>,
  }),
];

interface Props {
  invoices: Invoice[];
  onAdd?: () => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

const InvoicesTable: React.FC<Props> = ({
  invoices,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <DataTable
      data={invoices}
      columns={columns}
      title="Invoices"
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default InvoicesTable;