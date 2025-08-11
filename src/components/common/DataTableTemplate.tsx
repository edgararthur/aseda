import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

export interface DataTableTemplateProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export function DataTableTemplate({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  emptyMessage = 'No data available'
}: DataTableTemplateProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
                {showActions && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(row)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility component for status badges
export function StatusBadge({ status, variant = 'default' }: { status: string; variant?: 'default' | 'success' | 'warning' | 'destructive' }) {
  const getVariant = (status: string) => {
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes('active') || lowercaseStatus.includes('paid') || lowercaseStatus.includes('completed')) {
      return 'default';
    }
    if (lowercaseStatus.includes('pending') || lowercaseStatus.includes('draft')) {
      return 'secondary';
    }
    if (lowercaseStatus.includes('overdue') || lowercaseStatus.includes('cancelled')) {
      return 'destructive';
    }
    return variant;
  };

  return (
    <Badge variant={getVariant(status)} className="capitalize">
      {status}
    </Badge>
  );
}

// Utility component for currency formatting
export function CurrencyCell({ amount, currency = 'GHS' }: { amount: number; currency?: string }) {
  return (
    <span className={cn(
      "font-medium",
      amount >= 0 ? "text-green-600" : "text-red-600"
    )}>
      {new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: currency,
      }).format(amount)}
    </span>
  );
}

// Utility component for date formatting
export function DateCell({ date }: { date: string | Date }) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return (
    <span className="text-gray-700">
      {dateObj.toLocaleDateString('en-GH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </span>
  );
}