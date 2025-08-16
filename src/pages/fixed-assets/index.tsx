import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useFixedAssets, useAssetCategories } from '@/hooks/use-database';
import type { FixedAsset } from '@/lib/database';
import { toast } from 'sonner';
import { Building2, DollarSign, TrendingDown, Calendar } from 'lucide-react';

export default function FixedAssetsPage() {
  const { hasPermission } = useAuth();
  const {
    data: assets,
    loading,
    error,
    createFixedAsset,
    update: updateFixedAsset,
    delete: deleteFixedAsset,
    searchData,
    refresh
  } = useFixedAssets({ realtime: true });

  const { data: categories } = useAssetCategories({ realtime: true });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<FixedAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Form data matching database schema
  const [formData, setFormData] = useState({
    asset_code: '',
    asset_name: '',
    category_id: '',
    description: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_cost: 0,
    salvage_value: 0,
    useful_life_years: 5,
    depreciation_method: 'straight_line' as 'straight_line' | 'declining_balance',
    status: 'active' as 'active' | 'disposed' | 'retired',
    location: '',
    serial_number: '',
    warranty_expiry: '',
    last_maintenance_date: '',
    next_maintenance_date: ''
  });

  // Handle search
  useEffect(() => {
    if (searchTerm.trim()) {
      searchData(searchTerm);
    } else {
      refresh();
    }
  }, [searchTerm, searchData, refresh]);

  // Reset form
  const resetForm = () => {
    setFormData({
      asset_code: '',
      asset_name: '',
      category_id: '',
      description: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_cost: 0,
      salvage_value: 0,
      useful_life_years: 5,
      depreciation_method: 'straight_line',
      status: 'active',
      location: '',
      serial_number: '',
      warranty_expiry: '',
      last_maintenance_date: '',
      next_maintenance_date: ''
    });
    setCurrentAsset(null);
  };

  // Generate asset code
  const generateAssetCode = () => {
    const count = (assets as FixedAsset[])?.length || 0;
    return `ASSET-${String(count + 1).padStart(4, '0')}`;
  };

  const handleAdd = () => {
    resetForm();
    setFormData(prev => ({ ...prev, asset_code: generateAssetCode() }));
    setIsCreateModalOpen(true);
  };

  const handleEdit = (asset: FixedAsset) => {
    setCurrentAsset(asset);
    setFormData({
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      category_id: asset.category_id || '',
      description: asset.description || '',
      purchase_date: asset.purchase_date || new Date().toISOString().split('T')[0],
      purchase_cost: asset.purchase_cost || 0,
      salvage_value: asset.salvage_value || 0,
      useful_life_years: asset.useful_life_years || 5,
      depreciation_method: (asset.depreciation_method as 'straight_line' | 'declining_balance') || 'straight_line',
      status: (asset.status as 'active' | 'disposed' | 'retired') || 'active',
      location: asset.location || '',
      serial_number: asset.serial_number || '',
      warranty_expiry: asset.warranty_expiry || '',
      last_maintenance_date: asset.last_maintenance_date || '',
      next_maintenance_date: asset.next_maintenance_date || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (asset: FixedAsset) => {
    if (window.confirm(`Are you sure you want to delete asset ${asset.asset_name}?`)) {
      try {
        await deleteFixedAsset(asset.id);
        toast.success('Asset deleted successfully');
      } catch (error) {
        // Error is already handled by the hook
      }
    }
  };

  // Handle create asset
  const handleCreateAsset = async () => {
    try {
      setModalLoading(true);
      await createFixedAsset(formData);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Asset created successfully');
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setModalLoading(false);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!currentAsset) return;
    
    try {
      setModalLoading(true);
      await updateFixedAsset(currentAsset.id, formData);
      setIsEditModalOpen(false);
      resetForm();
      toast.success('Asset updated successfully');
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setModalLoading(false);
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
      key: 'asset_code',
      label: 'Asset Code',
      render: (value, asset) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'asset_name',
      label: 'Asset Name',
      render: (value, asset) => value || 'N/A'
    },
    {
      key: 'category_id',
      label: 'Category',
      render: (value, asset) => {
        const category = (categories as any[])?.find(cat => cat.id === value);
        return category?.name || 'N/A';
      }
    },
    {
      key: 'purchase_cost',
      label: 'Purchase Cost',
      render: (value, asset) => `₵${(value ?? 0).toLocaleString()}`
    },
    {
      key: 'current_book_value',
      label: 'Current Value',
      render: (value, asset) => `₵${(value ?? 0).toLocaleString()}`
    },
    {
      key: 'accumulated_depreciation',
      label: 'Depreciation',
      render: (value, asset) => `₵${(value ?? 0).toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, asset) => getStatusBadge(value || 'active')
    }
  ];

  const typedAssets = (assets as FixedAsset[]) || [];
  const totalPurchasePrice = typedAssets.reduce((sum, asset) => sum + (asset.purchase_cost || 0), 0);
  const totalCurrentValue = typedAssets.reduce((sum, asset) => sum + (asset.current_book_value || 0), 0);
  const totalDepreciation = typedAssets.reduce((sum, asset) => sum + (asset.accumulated_depreciation || 0), 0);

    return (
    <PageTemplate
      title="Fixed Assets"
      description="Manage your company's fixed assets, track depreciation, and monitor asset values."
      onAdd={hasPermission('assets:write') ? handleAdd : undefined}
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
        data={typedAssets.filter(asset => 
          asset.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.location?.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No fixed assets found. Add your first asset to get started."
      />

      {/* Create Asset Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Fixed Asset</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="asset_code">Asset Code</Label>
                  <Input
                    id="asset_code"
                    value={formData.asset_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_code: e.target.value }))}
                    placeholder="ASSET-0001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="asset_name">Asset Name *</Label>
                  <Input
                    id="asset_name"
                    value={formData.asset_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_name: e.target.value }))}
                    placeholder="Office Building"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories as any[])?.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                    placeholder="SN123456789"
                  />
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Purchase Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="purchase_cost">Purchase Cost (GHS)</Label>
                  <Input
                    id="purchase_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchase_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchase_cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="50000.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="salvage_value">Salvage Value (GHS)</Label>
                  <Input
                    id="salvage_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salvage_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, salvage_value: parseFloat(e.target.value) || 0 }))}
                    placeholder="5000.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="useful_life_years">Useful Life (Years)</Label>
                  <Input
                    id="useful_life_years"
                    type="number"
                    min="1"
                    value={formData.useful_life_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, useful_life_years: parseInt(e.target.value) || 5 }))}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="depreciation_method">Depreciation Method</Label>
                  <Select
                    value={formData.depreciation_method}
                    onValueChange={(value: 'straight_line' | 'declining_balance') => 
                      setFormData(prev => ({ ...prev, depreciation_method: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight_line">Straight Line</SelectItem>
                      <SelectItem value="declining_balance">Declining Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'disposed' | 'retired') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="disposed">Disposed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Main Office"
                  />
                </div>
                
                <div>
                  <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                  <Input
                    id="warranty_expiry"
                    type="date"
                    value={formData.warranty_expiry}
                    onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Asset description and notes"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAsset} 
              disabled={modalLoading || !formData.asset_name}
            >
              {modalLoading ? 'Creating...' : 'Create Asset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fixed Asset</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_asset_code">Asset Code</Label>
                  <Input
                    id="edit_asset_code"
                    value={formData.asset_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_code: e.target.value }))}
                    placeholder="ASSET-0001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_asset_name">Asset Name *</Label>
                  <Input
                    id="edit_asset_name"
                    value={formData.asset_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_name: e.target.value }))}
                    placeholder="Office Building"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_category_id">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories as any[])?.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'disposed' | 'retired') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="disposed">Disposed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Asset description and notes"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={modalLoading || !formData.asset_name}
            >
              {modalLoading ? 'Updating...' : 'Update Asset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 