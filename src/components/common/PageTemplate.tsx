import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PageTemplateProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showAddButton?: boolean;
  showSearchBar?: boolean;
  showFilters?: boolean;
  showExportImport?: boolean;
  onAdd?: () => void;
  onSearch?: (query: string) => void;
  onExport?: () => void;
  onImport?: () => void;
  customActions?: React.ReactNode;
}

export function PageTemplate({
  title,
  description,
  children,
  showAddButton = true,
  showSearchBar = true,
  showFilters = true,
  showExportImport = true,
  onAdd,
  onSearch,
  onExport,
  onImport,
  customActions
}: PageTemplateProps) {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {showExportImport && (
            <>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </>
          )}
          
          {customActions}
          
          {showAddButton && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      {(showSearchBar || showFilters) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {showSearchBar && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={`Search ${title.toLowerCase()}...`}
                    className="pl-10"
                    onChange={(e) => onSearch?.(e.target.value)}
                  />
                </div>
              )}
              
              {showFilters && (
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Content */}
      <div className="flex-1 space-y-6 min-h-0">
        {children}
      </div>
    </div>
  );
}