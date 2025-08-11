import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Building2, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FixedAsset {
  id: string;
  assetName: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  accumulatedDepreciation: number;
  depreciationMethod: 'straight-line' | 'declining-balance' | 'units-of-production';
  usefulLife: number;
  status: 'active' | 'disposed' | 'retired';
  location: string;
}

export default function FixedAssetsPage() {
  const { hasPermission } = useAuth();
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Partial<FixedAsset> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      // Mock fixed assets data
      const mockAssets: FixedAsset[] = [
        {
          id: '1',
          assetName: 'Office Building',
          category: 'Building',
          purchaseDate: '2020-01-15',
          purchasePrice: 500000,
          currentValue: 450000,
          accumulatedDepreciation: 50000,
          depreciationMethod: 'straight-line',
          usefulLife: 25,
          status: 'active',
          location: 'Main Office'
        },
        {
          id: '2',
          assetName: 'Company Vehicles',
          category: 'Vehicle',
          purchaseDate: '2022-03-10',
          purchasePrice: 45000,
          currentValue: 35000,
          accumulatedDepreciation: 10000,
          depreciationMethod: 'declining-balance',
          usefulLife: 5,
          status: 'active',
          location: 'Fleet'
        },
        {
          id: '3',
          assetName: 'Computer Equipment',
          category: 'Equipment',
          purchaseDate: '2023-01-20',
          purchasePrice: 25000,
          currentValue: 20000,
          accumulatedDepreciation: 5000,
          depreciationMethod: 'straight-line',
          usefulLife: 3,
          status: 'active',
          location: 'IT Department'
        }
      ];

      setAssets(mockAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to fetch fixed assets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'disposed':
        return <Badge className="bg-red-100 text-red-800">Disposed</Badge>;
      case 'retired':
        return <Badge className="bg-gray-100 text-gray-800">Retired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'assetName',
      label: 'Asset Name',
      render: (asset) => asset.assetName
    },
    {
      key: 'category',
      label: 'Category',
      render: (asset) => asset.category
    },
    {
      key: 'purchasePrice',
      label: 'Purchase Price',
      render: (asset) => `₵${asset.purchasePrice.toLocaleString()}`
    },
    {
      key: 'currentValue',
      label: 'Current Value',
      render: (asset) => `₵${asset.currentValue.toLocaleString()}`
    },
    {
      key: 'accumulatedDepreciation',
      label: 'Depreciation',
      render: (asset) => `₵${asset.accumulatedDepreciation.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (asset) => getStatusBadge(asset.status)
    }
  ];

  const totalPurchasePrice = assets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
  const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalDepreciation = assets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);

    return (
    <PageTemplate
      title="Fixed Assets"
      description="Manage your company's fixed assets, track depreciation, and monitor asset values."
      onAdd={hasPermission('assets:write') ? () => setIsModalOpen(true) : undefined}
      onSearch={setSearchTerm}
      showAddButton={hasPermission('assets:write')}
      showExportImport={true}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-muted-foreground">Fixed assets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalPurchasePrice.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Original cost</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalCurrentValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Net book value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Depreciation</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalDepreciation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Accumulated</p>
          </CardContent>
        </Card>
        </div>

      {/* Data Table */}
      <DataTableTemplate
        data={assets.filter(asset => 
          asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.category.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        columns={columns}
        loading={loading}
        emptyMessage="No fixed assets found"
      />
    </PageTemplate>
    );
} 