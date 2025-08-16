import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column, StatusBadge, CurrencyCell } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-database';
import { useAuth } from '@/contexts/AuthContext';
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

// Use the Product type from database
import type { Product } from '@/lib/database';

// Using stats from the hook instead of local interface

export default function ProductsPage() {
  const { hasPermission } = useAuth();
  const {
    data: products,
    loading,
    error,
    stats,
    statsLoading,
    createProduct,
    update: updateProduct,
    updateStock,
    delete: deleteProduct,
    searchData,
    refresh
  } = useProducts({ realtime: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    type: 'inventory' as 'inventory' | 'non_inventory' | 'service',
    sales_price: 0,
    purchase_price: 0,
    tax_rate: 0,
    unit: 'each',
    quantity_on_hand: 0,
    reorder_point: 0,
    is_active: true
  });

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
          <div className="text-sm text-gray-500">{row.type}</div>
        </div>
      )
    },
    {
      key: 'sales_price',
      label: 'Sales Price',
      render: (value) => <CurrencyCell amount={value} />
    },
    {
      key: 'quantity_on_hand',
      label: 'Stock',
      render: (value, row) => {
        const isLowStock = value <= row.reorder_point && value > 0;
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
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      searchData(searchQuery);
    } else {
      refresh();
    }
  }, [searchQuery, searchData, refresh]);

  // Reset form
  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      type: 'inventory',
      sales_price: 0,
      purchase_price: 0,
      tax_rate: 0,
      unit: 'each',
      quantity_on_hand: 0,
      reorder_point: 0,
      is_active: true
    });
  };
  // Handle create product
  const handleCreateProduct = async () => {
    try {
      await createProduct(formData);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      type: product.type,
      sales_price: product.sales_price,
      purchase_price: product.purchase_price,
      tax_rate: product.tax_rate,
      unit: product.unit,
      quantity_on_hand: product.quantity_on_hand,
      reorder_point: product.reorder_point,
      is_active: product.is_active
    });
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!currentProduct) return;
    
    try {
      await updateProduct(currentProduct.id, formData);
      setIsEditModalOpen(false);
      resetForm();
      setCurrentProduct(null);
    } catch (error) {
      // Error is already handled by the hook
    }
  };
  // Handle delete with confirmation
  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete product ${product.name}?`)) {
      try {
        await deleteProduct(product.id);
      } catch (error) {
        // Error is already handled by the hook
      }
    }
  };

  const handleAdd = () => {
    setCurrentProduct(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const typedProducts = (products as Product[]) || [];
  const filteredProducts = typedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.type.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
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
            <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
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
            <div className="text-2xl font-bold text-yellow-600">{stats?.lowStock || 0}</div>
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
            <div className="text-2xl font-bold text-red-600">{stats?.outOfStock || 0}</div>
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
              <CurrencyCell amount={stats?.totalValue || 0} />
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
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        emptyMessage="No products found. Add your first product to get started."
      />

      {/* Create Product Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="PROD-001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Product Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'inventory' | 'non_inventory' | 'service') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="non_inventory">Non-Inventory</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="each, kg, liter"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sales_price">Sales Price (GHS)</Label>
                <Input
                  id="sales_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sales_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, sales_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="100.00"
                />
              </div>
              
              <div>
                <Label htmlFor="purchase_price">Purchase Price (GHS)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="80.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="12.5"
                />
              </div>
              
              <div>
                <Label htmlFor="reorder_point">Reorder Point</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  min="0"
                  value={formData.reorder_point}
                  onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
                  placeholder="10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="quantity_on_hand">Initial Quantity</Label>
              <Input
                id="quantity_on_hand"
                type="number"
                min="0"
                value={formData.quantity_on_hand}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity_on_hand: parseInt(e.target.value) || 0 }))}
                placeholder="100"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProduct} 
              disabled={!formData.sku || !formData.name}
            >
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_sku">SKU *</Label>
                <Input
                  id="edit_sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="PROD-001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_name">Product Name *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_type">Product Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'inventory' | 'non_inventory' | 'service') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="non_inventory">Non-Inventory</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_unit">Unit</Label>
                <Input
                  id="edit_unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="each, kg, liter"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_sales_price">Sales Price (GHS)</Label>
                <Input
                  id="edit_sales_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sales_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, sales_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="100.00"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_purchase_price">Purchase Price (GHS)</Label>
                <Input
                  id="edit_purchase_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="80.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_tax_rate">Tax Rate (%)</Label>
                <Input
                  id="edit_tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="12.5"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_reorder_point">Reorder Point</Label>
                <Input
                  id="edit_reorder_point"
                  type="number"
                  min="0"
                  value={formData.reorder_point}
                  onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
                  placeholder="10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_quantity_on_hand">Current Quantity</Label>
              <Input
                id="edit_quantity_on_hand"
                type="number"
                min="0"
                value={formData.quantity_on_hand}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity_on_hand: parseInt(e.target.value) || 0 }))}
                placeholder="100"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={!formData.sku || !formData.name}
            >
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 