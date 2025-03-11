import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';

interface PageContainerProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    onNew?: () => void;
    onExport?: () => void;
    actions?: React.ReactNode;
}

export function PageContainer({
    title,
    description,
    children,
    onNew,
    onExport,
    actions
}: PageContainerProps) {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {actions}
                    {onExport && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onExport}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    )}
                    {onNew && (
                        <Button
                            size="sm"
                            onClick={onNew}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New
                        </Button>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
} 