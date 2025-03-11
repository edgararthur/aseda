import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PurchaseReturnFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: PurchaseReturn;
}

interface PurchaseReturn {
    id?: string;
    reference_no: string;
    supplier: string;
    date: string;
    total_amount: number;
    status: string;
    paid: number;
    notes?: string;
}

const INITIAL_DATA: PurchaseReturn = {
    reference_no: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    status: 'PENDING',
    paid: 0,
    notes: ''
};

export function PurchaseReturnForm({ isOpen, onClose, onSuccess, initialData }: PurchaseReturnFormProps) {
    const [formData, setFormData] = useState<PurchaseReturn>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                date: new Date(initialData.date).toISOString().split('T')[0]
            });
        } else {
            setFormData(INITIAL_DATA);
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.reference_no) {
            newErrors.reference_no = 'Reference number is required';
        }
        if (!formData.supplier) {
            newErrors.supplier = 'Supplier is required';
        }
        if (!formData.date) {
            newErrors.date = 'Date is required';
        }
        if (formData.total_amount <= 0) {
            newErrors.total_amount = 'Total amount must be greater than 0';
        }
        if (formData.paid < 0) {
            newErrors.paid = 'Paid amount cannot be negative';
        }
        if (formData.paid > formData.total_amount) {
            newErrors.paid = 'Paid amount cannot exceed total amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { error } = initialData?.id 
                ? await supabase
                    .from('purchase_returns')
                    .update(formData)
                    .eq('id', initialData.id)
                : await supabase
                    .from('purchase_returns')
                    .insert([formData]);

            if (error) throw error;

            toast.success(
                initialData?.id 
                    ? 'Purchase return updated successfully' 
                    : 'Purchase return created successfully'
            );
            onSuccess();
            onClose();
        } catch (err) {
            toast.error('Failed to save purchase return');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        field: keyof PurchaseReturn,
        value: string | number
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when field is edited
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData?.id ? 'Edit Purchase Return' : 'New Purchase Return'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reference_no">Reference Number</Label>
                        <Input
                            id="reference_no"
                            value={formData.reference_no}
                            onChange={e => handleChange('reference_no', e.target.value)}
                            className={cn(errors.reference_no && "border-red-500")}
                            aria-invalid={!!errors.reference_no}
                            aria-errormessage={errors.reference_no}
                        />
                        {errors.reference_no && (
                            <p className="text-sm text-red-500">{errors.reference_no}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input
                            id="supplier"
                            value={formData.supplier}
                            onChange={e => handleChange('supplier', e.target.value)}
                            className={cn(errors.supplier && "border-red-500")}
                            aria-invalid={!!errors.supplier}
                            aria-errormessage={errors.supplier}
                        />
                        {errors.supplier && (
                            <p className="text-sm text-red-500">{errors.supplier}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={e => handleChange('date', e.target.value)}
                            className={cn(errors.date && "border-red-500")}
                            aria-invalid={!!errors.date}
                            aria-errormessage={errors.date}
                        />
                        {errors.date && (
                            <p className="text-sm text-red-500">{errors.date}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="total_amount">Total Amount (GHS)</Label>
                        <Input
                            id="total_amount"
                            type="number"
                            step="0.01"
                            value={formData.total_amount}
                            onChange={e => handleChange('total_amount', parseFloat(e.target.value))}
                            className={cn(errors.total_amount && "border-red-500")}
                            aria-invalid={!!errors.total_amount}
                            aria-errormessage={errors.total_amount}
                        />
                        {errors.total_amount && (
                            <p className="text-sm text-red-500">{errors.total_amount}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paid">Paid Amount (GHS)</Label>
                        <Input
                            id="paid"
                            type="number"
                            step="0.01"
                            value={formData.paid}
                            onChange={e => handleChange('paid', parseFloat(e.target.value))}
                            className={cn(errors.paid && "border-red-500")}
                            aria-invalid={!!errors.paid}
                            aria-errormessage={errors.paid}
                        />
                        {errors.paid && (
                            <p className="text-sm text-red-500">{errors.paid}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={value => handleChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={e => handleChange('notes', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : initialData?.id ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 