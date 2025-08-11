import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PiggyBank, FileText, DollarSign, Percent } from 'lucide-react';

interface WithholdingTax {
    id: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceAmount: number;
  taxRate: number;
  taxAmount: number;
  taxType: 'VAT' | 'Income Tax' | 'NHIL' | 'GetFund';
  status: 'pending' | 'filed' | 'paid';
  dueDate: string;
  filedDate?: string;
}

export default function WithholdingTaxPage() {
    const [taxes, setTaxes] = useState<WithholdingTax[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWithholdingTaxes();
  }, []);

  const fetchWithholdingTaxes = async () => {
    try {
      // Mock withholding tax data
      const mockTaxes: WithholdingTax[] = [
        {
          id: '1',
          supplierName: 'ABC Construction Ltd',
          invoiceNumber: 'INV-2024-001',
          invoiceAmount: 50000,
          taxRate: 5,
          taxAmount: 2500,
          taxType: 'VAT',
          status: 'filed',
          dueDate: '2024-02-15',
          filedDate: '2024-02-10'
        },
        {
          id: '2',
          supplierName: 'Tech Solutions Ghana',
          invoiceNumber: 'INV-2024-002',
          invoiceAmount: 30000,
          taxRate: 5,
          taxAmount: 1500,
          taxType: 'Income Tax',
          status: 'pending',
          dueDate: '2024-02-28'
        },
        {
          id: '3',
          supplierName: 'Office Supplies Co.',
          invoiceNumber: 'INV-2024-003',
          invoiceAmount: 8000,
          taxRate: 2.5,
          taxAmount: 200,
          taxType: 'NHIL',
          status: 'paid',
          dueDate: '2024-02-20',
          filedDate: '2024-02-15'
        }
      ];

      setTaxes(mockTaxes);
    } catch (error) {
      console.error('Error fetching withholding taxes:', error);
      toast.error('Failed to fetch withholding tax data');
        } finally {
            setLoading(false);
        }
    };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'filed':
        return <Badge className="bg-blue-100 text-blue-800">Filed</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTaxTypeBadge = (taxType: string) => {
    const colors = {
      'VAT': 'bg-purple-100 text-purple-800',
      'Income Tax': 'bg-orange-100 text-orange-800',
      'NHIL': 'bg-blue-100 text-blue-800',
      'GetFund': 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[taxType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{taxType}</Badge>;
  };

  const columns: Column[] = [
    {
      key: 'supplierName',
      label: 'Supplier',
      render: (tax) => tax.supplierName
    },
    {
      key: 'invoiceNumber',
      label: 'Invoice Number',
      render: (tax) => <span className="font-mono text-sm">{tax.invoiceNumber}</span>
    },
    {
      key: 'invoiceAmount',
      label: 'Invoice Amount',
      render: (tax) => `₵${tax.invoiceAmount.toLocaleString()}`
    },
    {
      key: 'taxType',
      label: 'Tax Type',
      render: (tax) => getTaxTypeBadge(tax.taxType)
    },
    {
      key: 'taxRate',
      label: 'Tax Rate',
      render: (tax) => `${tax.taxRate}%`
    },
    {
      key: 'taxAmount',
      label: 'Tax Amount',
      render: (tax) => `₵${tax.taxAmount.toLocaleString()}`
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (tax) => new Date(tax.dueDate).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (tax) => getStatusBadge(tax.status)
    }
  ];

  const totalTaxAmount = taxes.reduce((sum, tax) => sum + tax.taxAmount, 0);
  const pendingTaxes = taxes.filter(tax => tax.status === 'pending').length;
  const overdueCount = taxes.filter(tax => 
    tax.status === 'pending' && new Date(tax.dueDate) < new Date()
  ).length;

    return (
    <PageTemplate
            title="Withholding Tax"
      description="Manage withholding tax obligations, track payments, and ensure compliance."
      onSearch={setSearchTerm}
      showAddButton={false}
      showExportImport={true}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Obligations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxes.length}</div>
            <p className="text-xs text-muted-foreground">Tax obligations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalTaxAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Withheld to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTaxes}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTableTemplate
        data={taxes.filter(tax => 
          tax.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tax.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tax.taxType.toLowerCase().includes(searchTerm.toLowerCase())
        )}
                columns={columns}
                loading={loading}
        emptyMessage="No withholding tax records found"
      />
    </PageTemplate>
    );
} 