import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface FilterValues {
    dateFrom: string;
    dateTo: string;
    status: string;
    minAmount: string;
    maxAmount: string;
}

interface PurchaseReturnFiltersProps {
    onApply: (filters: FilterValues) => void;
    onReset: () => void;
}

const INITIAL_FILTERS: FilterValues = {
    dateFrom: '',
    dateTo: '',
    status: '',
    minAmount: '',
    maxAmount: ''
};

export function PurchaseReturnFilters({ onApply, onReset }: PurchaseReturnFiltersProps) {
    const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTERS);

    const handleChange = (field: keyof FilterValues, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApply = () => {
        onApply(filters);
    };

    const handleReset = () => {
        setFilters(INITIAL_FILTERS);
        onReset();
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Filters</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X size={16} className="mr-1" />
                    Clear
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dateFrom">From Date</Label>
                    <Input
                        id="dateFrom"
                        type="date"
                        value={filters.dateFrom}
                        onChange={e => handleChange('dateFrom', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateTo">To Date</Label>
                    <Input
                        id="dateTo"
                        type="date"
                        value={filters.dateTo}
                        onChange={e => handleChange('dateTo', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={filters.status}
                        onValueChange={value => handleChange('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="minAmount">Min Amount (GHS)</Label>
                    <Input
                        id="minAmount"
                        type="number"
                        step="0.01"
                        value={filters.minAmount}
                        onChange={e => handleChange('minAmount', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="maxAmount">Max Amount (GHS)</Label>
                    <Input
                        id="maxAmount"
                        type="number"
                        step="0.01"
                        value={filters.maxAmount}
                        onChange={e => handleChange('maxAmount', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleApply}>
                    Apply Filters
                </Button>
            </div>
        </div>
    );
} 