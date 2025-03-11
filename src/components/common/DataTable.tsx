import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Column<T> {
    header: string | (() => React.ReactNode);
    accessor: keyof T | ((item: T) => React.ReactNode);
    align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    error?: string | null;
    onSearch?: (term: string) => void;
    searchPlaceholder?: string;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export function DataTable<T>({
    columns,
    data,
    loading = false,
    error = null,
    onSearch,
    searchPlaceholder = 'Search...',
    page = 1,
    totalPages = 1,
    onPageChange
}: DataTableProps<T>) {
    const getCellContent = (item: T, accessor: Column<T>['accessor']) => {
        if (typeof accessor === 'function') {
            return accessor(item);
        }
        return item[accessor];
    };

    const getColumnAlignment = (align?: Column<T>['align']) => {
        switch (align) {
            case 'right': return 'text-right';
            case 'center': return 'text-center';
            default: return 'text-left';
        }
    };

    if (error) {
        return (
            <div className="text-center p-4 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {onSearch && (
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            )}

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${getColumnAlignment(column.align)
                                            }`}
                                    >
                                        {typeof column.header === 'function' ? column.header() : column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No results.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`p-4 align-middle ${getColumnAlignment(column.align)
                                                    }`}
                                            >
                                                {getCellContent(item, column.accessor)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {onPageChange && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 