import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tags, Building2, Calendar, Percent } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssetCategory {
  id: string;
  categoryName: string;
  categoryCode: string;
  description: string;
  depreciationMethod: 'straight-line' | 'declining-balance' | 'units-of-production';
  usefulLife: number;
  depreciationRate: number;
  assetCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function AssetCategoriesPage() {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<AssetCategory> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [description, setDescription] = useState('');
  const [depreciationMethod, setDepreciationMethod] = useState<'straight-line' | 'declining-balance' | 'units-of-production'>('straight-line');
  const [usefulLife, setUsefulLife] = useState('');
  const [depreciationRate, setDepreciationRate] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Mock asset categories data
      const mockCategories: AssetCategory[] = [
        {
          id: '1',
          categoryName: 'Buildings',
          categoryCode: 'BLDG',
          description: 'Office buildings and structures',
          depreciationMethod: 'straight-line',
          usefulLife: 25,
          depreciationRate: 4.0,
          assetCount: 3,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '2',
          categoryName: 'Vehicles',
          categoryCode: 'VEH',
          description: 'Company cars, trucks, and transportation',
          depreciationMethod: 'declining-balance',
          usefulLife: 5,
          depreciationRate: 20.0,
          assetCount: 8,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '3',
          categoryName: 'Computer Equipment',
          categoryCode: 'COMP',
          description: 'Laptops, desktops, and IT hardware',
          depreciationMethod: 'straight-line',
          usefulLife: 3,
          depreciationRate: 33.33,
          assetCount: 25,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '4',
          categoryName: 'Office Equipment',
          categoryCode: 'OFF',
          description: 'Printers, scanners, office machinery',
          depreciationMethod: 'straight-line',
          usefulLife: 5,
          depreciationRate: 20.0,
          assetCount: 12,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '5',
          categoryName: 'Furniture & Fixtures',
          categoryCode: 'FURN',
          description: 'Desks, chairs, and office furniture',
          depreciationMethod: 'straight-line',
          usefulLife: 10,
          depreciationRate: 10.0,
          assetCount: 15,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        }
      ];

      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching asset categories:', error);
      toast.error('Failed to fetch asset categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentCategory(null);
    setCategoryName('');
    setCategoryCode('');
    setDescription('');
    setDepreciationMethod('straight-line');
    setUsefulLife('');
    setDepreciationRate('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleEdit = (category: AssetCategory) => {
    setCurrentCategory(category);
    setCategoryName(category.categoryName);
    setCategoryCode(category.categoryCode);
    setDescription(category.description);
    setDepreciationMethod(category.depreciationMethod);
    setUsefulLife(category.usefulLife.toString());
    setDepreciationRate(category.depreciationRate.toString());
    setStatus(category.status);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const lifeYears = parseInt(usefulLife);
      const rate = parseFloat(depreciationRate);
      
      // Calculate depreciation rate based on method and useful life
      let calculatedRate = rate;
      if (depreciationMethod === 'straight-line' && !rate) {
        calculatedRate = lifeYears > 0 ? (100 / lifeYears) : 0;
      }

      const categoryData = {
        id: currentCategory?.id || Date.now().toString(),
        categoryName,
        categoryCode,
        description,
        depreciationMethod,
        usefulLife: lifeYears,
        depreciationRate: calculatedRate,
        assetCount: currentCategory?.assetCount || 0,
        status,
        createdAt: currentCategory?.createdAt || new Date().toISOString()
      };

      if (currentCategory) {
        setCategories(prev => prev.map(c => c.id === currentCategory.id ? { ...categoryData, id: currentCategory.id } : c));
        toast.success('Asset category updated successfully');
      } else {
        setCategories(prev => [...prev, categoryData]);
        toast.success('Asset category created successfully');
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save asset category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (category && category.assetCount > 0) {
        toast.error('Cannot delete category with existing assets');
        return;
      }

      setCategories(prev => prev.filter(c => c.id !== categoryId));
      toast.success('Asset category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete asset category');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      'straight-line': 'bg-blue-100 text-blue-800',
      'declining-balance': 'bg-orange-100 text-orange-800',
      'units-of-production': 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>;
  };

  const columns: Column[] = [
    {
      key: 'categoryCode',
      label: 'Code',
      render: (category) => <span className="font-mono text-sm">{category.categoryCode}</span>
    },
    {
      key: 'categoryName',
      label: 'Category Name',
      render: (category) => category.categoryName
    },
    {
      key: 'depreciationMethod',
      label: 'Depreciation Method',
      render: (category) => getMethodBadge(category.depreciationMethod)
    },
    {
      key: 'usefulLife',
      label: 'Useful Life',
      render: (category) => `${category.usefulLife} years`
    },
    {
      key: 'depreciationRate',
      label: 'Depreciation Rate',
      render: (category) => `${category.depreciationRate.toFixed(2)}%`
    },
    {
      key: 'assetCount',
      label: 'Assets',
      render: (category) => (
        <div className="text-center">
          <span className="font-medium">{category.assetCount}</span>
          <div className="text-xs text-gray-500">assets</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (category) => getStatusBadge(category.status)
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (category: AssetCategory) => handleEdit(category),
      variant: 'outline' as const,
      show: () => hasPermission('assets:write')
    },
    {
      label: 'Delete',
      onClick: (category: AssetCategory) => handleDelete(category.id),
      variant: 'destructive' as const,
      show: (category: AssetCategory) => hasPermission('assets:delete') && category.assetCount === 0
    }
  ];

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.status === 'active').length;
  const totalAssets = categories.reduce((sum, cat) => sum + cat.assetCount, 0);
  const avgUsefulLife = categories.length > 0 
    ? Math.round(categories.reduce((sum, cat) => sum + cat.usefulLife, 0) / categories.length)
    : 0;

  return (
    <PageTemplate
      title="Asset Categories"
      description="Define asset categories with depreciation methods and useful life settings."
      onAdd={hasPermission('assets:write') ? handleAdd : undefined}
      onSearch={setSearchTerm}
      showAddButton={hasPermission('assets:write')}
      showExportImport={true}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">Asset categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCategories}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Useful Life</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUsefulLife}</div>
            <p className="text-xs text-muted-foreground">Years</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTableTemplate
        data={categories.filter(category => 
          category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        columns={columns}
        loading={loading}
        emptyMessage="No asset categories found"
        showActions={false}
      />

      {/* Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? 'Edit Asset Category' : 'Add New Asset Category'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Computer Equipment"
                />
              </div>
              
              <div>
                <Label htmlFor="category-code">Category Code</Label>
                <Input
                  id="category-code"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                  placeholder="COMP"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category description..."
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="depreciation-method">Depreciation Method</Label>
              <Select 
                value={depreciationMethod} 
                onValueChange={(value: 'straight-line' | 'declining-balance' | 'units-of-production') => setDepreciationMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight-line">Straight Line</SelectItem>
                  <SelectItem value="declining-balance">Declining Balance</SelectItem>
                  <SelectItem value="units-of-production">Units of Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="useful-life">Useful Life (Years)</Label>
                <Input
                  id="useful-life"
                  type="number"
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(e.target.value)}
                  placeholder="5"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <Label htmlFor="depreciation-rate">Rate (%)</Label>
                <Input
                  id="depreciation-rate"
                  type="number"
                  value={depreciationRate}
                  onChange={(e) => setDepreciationRate(e.target.value)}
                  placeholder="20"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {depreciationMethod === 'straight-line' && usefulLife && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <div className="font-medium text-blue-800">Calculated Depreciation Rate</div>
                <div className="text-blue-600">
                  {usefulLife ? (100 / parseInt(usefulLife)).toFixed(2) : 0}% per year
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}