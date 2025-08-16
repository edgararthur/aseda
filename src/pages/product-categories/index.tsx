import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tags, Package, Folder, Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductCategory {
    id: string;
  categoryName: string;
  categoryCode: string;
    description: string;
  parentCategory?: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function ProductCategoriesPage() {
  const { hasPermission } = useAuth();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<ProductCategory> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState('none');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    fetchCategories();
  }, []);

    const fetchCategories = async () => {
        try {
      // Mock categories data
      const mockCategories: ProductCategory[] = [
        {
          id: '1',
          categoryName: 'Electronics',
          categoryCode: 'ELEC',
          description: 'Electronic devices and components',
          productCount: 25,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '2',
          categoryName: 'Office Furniture',
          categoryCode: 'FURN',
          description: 'Desks, chairs, and office furniture',
          productCount: 12,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '3',
          categoryName: 'Software',
          categoryCode: 'SOFT',
          description: 'Software licenses and applications',
          parentCategory: 'Electronics',
          productCount: 8,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '4',
          categoryName: 'Stationery',
          categoryCode: 'STAT',
          description: 'Office supplies and stationery items',
          productCount: 35,
          status: 'active',
          createdAt: '2023-01-15T10:00:00Z'
        },
        {
          id: '5',
          categoryName: 'Deprecated Items',
          categoryCode: 'DEPR',
          description: 'Items no longer in use',
          productCount: 0,
          status: 'inactive',
          createdAt: '2023-01-15T10:00:00Z'
        }
      ];

      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch product categories');
        } finally {
            setLoading(false);
        }
    };

  const handleAdd = () => {
    setCurrentCategory(null);
    setCategoryName('');
    setCategoryCode('');
    setDescription('');
    setParentCategory('none');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleEdit = (category: ProductCategory) => {
    setCurrentCategory(category);
    setCategoryName(category.categoryName);
    setCategoryCode(category.categoryCode);
    setDescription(category.description);
    setParentCategory(category.parentCategory || 'none');
    setStatus(category.status);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const categoryData = {
        id: currentCategory?.id || Date.now().toString(),
        categoryName,
        categoryCode,
        description,
        parentCategory: parentCategory && parentCategory !== "none" ? parentCategory : undefined,
        productCount: currentCategory?.productCount || 0,
        status,
        createdAt: currentCategory?.createdAt || new Date().toISOString()
      };

      if (currentCategory) {
        setCategories(prev => prev.map(c => c.id === currentCategory.id ? { ...categoryData, id: currentCategory.id } : c));
        toast.success('Category updated successfully');
      } else {
        setCategories(prev => [...prev, categoryData]);
        toast.success('Category created successfully');
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (category && category.productCount > 0) {
        toast.error('Cannot delete category with existing products');
        return;
      }

      setCategories(prev => prev.filter(c => c.id !== categoryId));
            toast.success('Category deleted successfully');
    } catch (error) {
            toast.error('Failed to delete category');
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

  const columns: Column[] = [
    {
      key: 'categoryCode',
      label: 'Code',
      render: (value, category) => <span className="font-mono text-sm">{value || 'N/A'}</span>
    },
    {
      key: 'categoryName',
      label: 'Category Name',
      render: (value, category) => (
        <div>
          <div className="font-medium">{value || 'N/A'}</div>
          {category?.parentCategory && (
            <div className="text-sm text-gray-500">Parent: {category.parentCategory}</div>
          )}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, category) => (
        <span className="text-sm text-gray-600">
          {value && value.length > 50 
            ? `${value.substring(0, 50)}...` 
            : value || 'No description'
          }
        </span>
      )
    },
    {
      key: 'productCount',
      label: 'Products',
      render: (value, category) => (
        <div className="text-center">
          <span className="font-medium">{value ?? 0}</span>
          <div className="text-xs text-gray-500">items</div>
                </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, category) => getStatusBadge(value || 'active')
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value, category) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (category: ProductCategory) => handleEdit(category),
      variant: 'outline' as const,
      show: () => hasPermission('products:write')
    },
    {
      label: 'Delete',
      onClick: (category: ProductCategory) => handleDelete(category.id),
      variant: 'destructive' as const,
      show: (category: ProductCategory) => hasPermission('products:delete') && category.productCount === 0
    }
  ];

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.status === 'active').length;
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const parentCategories = categories.filter(cat => !cat.parentCategory).length;

    return (
    <PageTemplate
            title="Product Categories"
      description="Organize your products into categories for better inventory management and reporting."
      onAdd={hasPermission('products:write') ? handleAdd : undefined}
      onSearch={setSearchTerm}
      showAddButton={hasPermission('products:write')}
      showExportImport={true}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">All categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCategories}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parent Categories</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parentCategories}</div>
            <p className="text-xs text-muted-foreground">Top-level categories</p>
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
        emptyMessage="No product categories found"
        showActions={false}
      />

      {/* Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? 'Edit Category' : 'Add New Category'}
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
                  placeholder="Electronics"
                />
              </div>
              
              <div>
                <Label htmlFor="category-code">Category Code</Label>
                <Input
                  id="category-code"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                  placeholder="ELEC"
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
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parent-category">Parent Category (Optional)</Label>
                <Select value={parentCategory} onValueChange={setParentCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories
                      .filter(cat => cat.id !== currentCategory?.id && !cat.parentCategory)
                      .map(cat => (
                        <SelectItem key={cat.id} value={cat.categoryName}>
                          {cat.categoryName}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
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