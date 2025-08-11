import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, StatusBadge, CurrencyCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Package, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Product {
    id: string;
  name: string;
    sku: string;
  category: string;
  description: string;
  unit_price: number;
  cost_price: number;
  quantity_in_stock: number;
  reorder_level: number;
  status: 'active' | 'inactive' | 'discontinued';
    created_at: string;
    updated_at: string;
}

interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export default function ProductsPage() {
  const { user, profile } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });
    const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const columns: Column[] = [
    {
      key: 'sku',
      label: 'SKU',
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Product Name',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.category}</div>
        </div>
      )
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      render: (value) => <CurrencyCell amount={value} />
    },
    {
      key: 'quantity_in_stock',
      label: 'Stock',
      render: (value, row) => {
        const isLowStock = value <= row.reorder_level && value > 0;
        const isOutOfStock = value === 0;
        
        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${
              isOutOfStock ? 'text-red-600' : 
              isLowStock ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {value}
            </span>
            {isOutOfStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
            {isLowStock && <Clock className="w-4 h-4 text-yellow-500" />}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [profile]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
      
      // Mock data for now - replace with actual Supabase query
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'MacBook Pro 16"',
          sku: 'MBP-16-2024',
          category: 'Electronics',
          description: 'Apple MacBook Pro 16-inch with M3 chip',
          unit_price: 12500.00,
          cost_price: 10000.00,
          quantity_in_stock: 15,
          reorder_level: 5,
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Office Chair',
          sku: 'OFC-CHR-001',
          category: 'Furniture',
          description: 'Ergonomic office chair with lumbar support',
          unit_price: 850.00,
          cost_price: 600.00,
          quantity_in_stock: 3,
          reorder_level: 10,
          status: 'active',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z'
        },
        {
          id: '3',
          name: 'Wireless Mouse',
          sku: 'MSE-WRL-001',
          category: 'Accessories',
          description: 'Bluetooth wireless mouse',
          unit_price: 45.00,
          cost_price: 25.00,
          quantity_in_stock: 0,
          reorder_level: 20,
          status: 'active',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: '4',
          name: 'Standing Desk',
          sku: 'DSK-STD-001',
          category: 'Furniture',
          description: 'Height-adjustable standing desk',
          unit_price: 1200.00,
          cost_price: 800.00,
          quantity_in_stock: 25,
          reorder_level: 5,
          status: 'active',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z'
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    try {
      // Calculate stats from products
      const mockStats: ProductStats = {
        total: 4,
        active: 4,
        lowStock: 1,
        outOfStock: 1,
        totalValue: 218775.00 // Sum of (unit_price * quantity_in_stock)
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdd = () => {
    toast.info('Add product functionality coming soon!');
  };

  const handleEdit = (product: Product) => {
    toast.info(`Edit product ${product.name} - Coming soon!`);
  };

  const handleView = (product: Product) => {
    toast.info(`View product ${product.name} - Coming soon!`);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      toast.info('Delete functionality coming soon!');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
    <PageTemplate
      title="Products"
      description="Manage your product catalog and inventory"
      onAdd={handleAdd}
      onSearch={setSearchQuery}
      customActions={
        <Button variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
                            </Button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Available for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              Urgent restock needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyCell amount={stats.totalValue} />
                                </div>
            <p className="text-xs text-muted-foreground">
              Total stock value
            </p>
          </CardContent>
        </Card>
                            </div>

      {/* Products Table */}
      <DataTableTemplate
        columns={columns}
        data={filteredProducts}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        emptyMessage="No products found. Add your first product to get started."
      />
    </PageTemplate>
    );
} 