import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Activity, Package, AlertTriangle, TrendingDown } from 'lucide-react';

interface StockItem {
    id: string;
  productName: string;
  sku: string;
    category: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  totalValue: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
}

export default function StockManagementPage() {
  const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStockItems();
  }, []);

    const fetchStockItems = async () => {
        try {
      // Mock stock data
      const mockItems: StockItem[] = [
        {
          id: '1',
          productName: 'Office Chairs',
          sku: 'OFC-001',
          category: 'Furniture',
          currentStock: 25,
          reorderLevel: 10,
          unitPrice: 150,
          totalValue: 3750,
          status: 'in-stock',
          lastUpdated: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          productName: 'Laptop Computers',
          sku: 'TECH-002',
          category: 'Technology',
          currentStock: 5,
          reorderLevel: 8,
          unitPrice: 1200,
          totalValue: 6000,
          status: 'low-stock',
          lastUpdated: '2024-01-14T15:30:00Z'
        },
        {
          id: '3',
          productName: 'Printer Paper',
          sku: 'SUP-003',
          category: 'Supplies',
          currentStock: 0,
          reorderLevel: 20,
          unitPrice: 5,
          totalValue: 0,
          status: 'out-of-stock',
          lastUpdated: '2024-01-10T08:45:00Z'
        }
      ];

      setItems(mockItems);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast.error('Failed to fetch stock data');
        } finally {
            setLoading(false);
        }
    };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'sku',
      label: 'SKU',
      render: (item) => <span className="font-mono text-sm">{item.sku}</span>
    },
    {
      key: 'productName',
      label: 'Product Name',
      render: (item) => item.productName
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => item.category
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      render: (item) => item.currentStock.toString()
    },
    {
      key: 'reorderLevel',
      label: 'Reorder Level',
      render: (item) => item.reorderLevel.toString()
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      render: (item) => `₵${item.unitPrice.toLocaleString()}`
    },
    {
      key: 'totalValue',
      label: 'Total Value',
      render: (item) => `₵${item.totalValue.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => getStatusBadge(item.status)
    }
  ];

  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = items.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
  const totalItems = items.length;

    return (
    <PageTemplate
            title="Stock Management"
      description="Monitor inventory levels, track stock movements, and manage reorder points."
      onSearch={setSearchTerm}
      showAddButton={false}
      showExportImport={true}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need reorder</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Turnover</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2x</div>
            <p className="text-xs text-muted-foreground">Annual rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTableTemplate
        data={items.filter(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        )}
                columns={columns}
                loading={loading}
        emptyMessage="No stock items found"
      />
    </PageTemplate>
    );
} 