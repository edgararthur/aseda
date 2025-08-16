import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Coins, FileText, Calendar, DollarSign } from 'lucide-react';

interface VATReturn {
    id: string;
  period: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  totalSales: number;
  totalPurchases: number;
  outputVAT: number;
  inputVAT: number;
  netVAT: number;
  status: 'draft' | 'submitted' | 'approved' | 'overdue';
  submittedAt?: string;
}

export default function VATReturnsPage() {
    const [returns, setReturns] = useState<VATReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVATReturns();
  }, []);

  const fetchVATReturns = async () => {
    try {
      // Mock VAT returns data
      const mockReturns: VATReturn[] = [
        {
          id: '1',
          period: 'Q4 2023',
          startDate: '2023-10-01',
          endDate: '2023-12-31',
          dueDate: '2024-01-31',
          totalSales: 250000,
          totalPurchases: 150000,
          outputVAT: 31250,
          inputVAT: 18750,
          netVAT: 12500,
          status: 'submitted',
          submittedAt: '2024-01-25T10:00:00Z'
        },
        {
          id: '2',
          period: 'Q1 2024',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          dueDate: '2024-04-30',
          totalSales: 280000,
          totalPurchases: 170000,
          outputVAT: 35000,
          inputVAT: 21250,
          netVAT: 13750,
          status: 'draft'
        },
        {
          id: '3',
          period: 'Q2 2024',
          startDate: '2024-04-01',
          endDate: '2024-06-30',
          dueDate: '2024-07-31',
          totalSales: 300000,
          totalPurchases: 180000,
          outputVAT: 37500,
          inputVAT: 22500,
          netVAT: 15000,
          status: 'overdue'
        }
      ];

      setReturns(mockReturns);
    } catch (error) {
      console.error('Error fetching VAT returns:', error);
      toast.error('Failed to fetch VAT returns');
        } finally {
            setLoading(false);
        }
    };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800">Submitted</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'period',
      label: 'Period',
      render: (value, vatReturn) => value || 'N/A'
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value, vatReturn) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'totalSales',
      label: 'Total Sales',
      render: (value, vatReturn) => `₵${(value ?? 0).toLocaleString()}`
    },
    {
      key: 'outputVAT',
      label: 'Output VAT',
      render: (value, vatReturn) => `₵${(value ?? 0).toLocaleString()}`
    },
    {
      key: 'inputVAT',
      label: 'Input VAT',
      render: (value, vatReturn) => `₵${(value ?? 0).toLocaleString()}`
    },
    {
      key: 'netVAT',
      label: 'Net VAT',
      render: (value, vatReturn) => (
        <span className={(value ?? 0) >= 0 ? 'text-red-600' : 'text-green-600'}>
          ₵{Math.abs(value ?? 0).toLocaleString()}
          {(value ?? 0) >= 0 ? ' (Payable)' : ' (Refund)'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, vatReturn) => getStatusBadge(value || 'draft')
    }
  ];

  const totalNetVAT = returns.reduce((sum, ret) => sum + ret.netVAT, 0);
  const pendingReturns = returns.filter(ret => ret.status === 'draft' || ret.status === 'overdue').length;
  const overdueReturns = returns.filter(ret => ret.status === 'overdue').length;

    return (
    <PageTemplate
            title="VAT Returns"
      description="Manage VAT returns, track submissions, and monitor compliance deadlines."
      onSearch={setSearchTerm}
      showAddButton={false}
      showExportImport={true}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returns.length}</div>
            <p className="text-xs text-muted-foreground">VAT returns filed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net VAT Position</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalNetVAT >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₵{Math.abs(totalNetVAT).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalNetVAT >= 0 ? 'Payable' : 'Refundable'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReturns}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueReturns}</div>
            <p className="text-xs text-muted-foreground">Urgent action needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTableTemplate
        data={returns.filter(ret => 
          ret.period.toLowerCase().includes(searchTerm.toLowerCase())
        )}
                columns={columns}
                loading={loading}
        emptyMessage="No VAT returns found"
      />
    </PageTemplate>
    );
} 