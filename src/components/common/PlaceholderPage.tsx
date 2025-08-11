import React from 'react';
import { PageTemplate } from './PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowRight, BookOpen, Users, FileText, BarChart3 } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  features?: string[];
  comingSoon?: boolean;
}

export function PlaceholderPage({ 
  title, 
  description, 
  icon: Icon = FileText, 
  features = [], 
  comingSoon = true 
}: PlaceholderPageProps) {
  return (
    <PageTemplate
      title={title}
      description={description}
      showAddButton={false}
      showSearchBar={false}
      showFilters={false}
      showExportImport={false}
    >
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <Icon className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {comingSoon && (
              <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                <Construction className="w-5 h-5" />
                <span className="font-medium">Coming Soon</span>
              </div>
            )}
            
            {features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Planned Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-left p-3 bg-gray-50 rounded-lg">
                      <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <p className="text-gray-600 mb-4">
                This feature is currently under development. We're working hard to bring you the best experience.
              </p>
              <Button variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}