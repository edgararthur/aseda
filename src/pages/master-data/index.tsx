import { useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  Database,
  Users,
  Building,
  Package,
  CreditCard,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MasterDataSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  route: string;
  permission: string;
}

export default function MasterData() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const masterDataSections: MasterDataSection[] = [
    {
      id: 'contacts',
      title: 'Contacts',
      description: 'Manage customers, suppliers, and other business contacts',
      icon: Users,
      count: 0, // TODO: Get actual count
      route: '/dashboard/contacts',
      permission: 'contacts:read'
    },
    {
      id: 'products',
      title: 'Products & Services',
      description: 'Manage your product catalog and service offerings',
      icon: Package,
      count: 0, // TODO: Get actual count
      route: '/dashboard/products',
      permission: 'products:read'
    },
    {
      id: 'chart-of-accounts',
      title: 'Chart of Accounts',
      description: 'Configure your accounting structure and account codes',
      icon: CreditCard,
      count: 0, // TODO: Get actual count
      route: '/dashboard/chart-of-accounts',
      permission: 'accounts:read'
    },
    {
      id: 'departments',
      title: 'Departments',
      description: 'Organize your business into departments and cost centers',
      icon: Building,
      count: 0, // TODO: Get actual count
      route: '/dashboard/departments',
      permission: 'departments:read'
    },
    {
      id: 'employees',
      title: 'Employees',
      description: 'Manage employee information and organizational structure',
      icon: Users,
      count: 0, // TODO: Get actual count
      route: '/dashboard/employees',
      permission: 'employees:read'
    },
    {
      id: 'tax-settings',
      title: 'Tax Settings',
      description: 'Configure tax rates, types, and calculation rules',
      icon: FileText,
      count: 0, // TODO: Get actual count
      route: '/dashboard/tax-settings',
      permission: 'tax:read'
    }
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const quickActions = [
    {
      title: 'Add Customer',
      description: 'Create a new customer record',
      icon: Users,
      action: () => navigate('/dashboard/contacts?type=customer&action=add'),
      permission: 'contacts:write'
    },
    {
      title: 'Add Product',
      description: 'Add a new product or service',
      icon: Package,
      action: () => navigate('/dashboard/products?action=add'),
      permission: 'products:write'
    },
    {
      title: 'Add Account',
      description: 'Create a new chart of accounts entry',
      icon: CreditCard,
      action: () => navigate('/dashboard/chart-of-accounts?action=add'),
      permission: 'accounts:write'
    },
    {
      title: 'Add Employee',
      description: 'Register a new employee',
      icon: Users,
      action: () => navigate('/dashboard/employees?action=add'),
      permission: 'employees:write'
    }
  ];

  return (
    <PageTemplate
      title="Master Data"
      description="Manage all your core business data and configurations"
      showAddButton={false}
      showSearchBar={false}
      showExportImport={false}
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masterDataSections.map((section) => {
              const Icon = section.icon;
              const hasAccess = hasPermission(section.permission);

              return (
                <Card
                  key={section.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    hasAccess ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => hasAccess && handleNavigate(section.route)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {section.count} records
                          </div>
                        </div>
                      </div>
                      {hasAccess && (
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{section.description}</CardDescription>
                    {!hasAccess && (
                      <div className="mt-2 text-xs text-red-500">
                        Insufficient permissions
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const hasAccess = hasPermission(action.permission);

              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    hasAccess ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => hasAccess && action.action()}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      disabled={!hasAccess}
                      onClick={(e) => {
                        e.stopPropagation();
                        hasAccess && action.action();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {action.title}
                    </Button>
                    {!hasAccess && (
                      <div className="mt-2 text-xs text-red-500">
                        Insufficient permissions
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}