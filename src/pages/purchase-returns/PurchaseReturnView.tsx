import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatGHSCurrency } from '@/lib/tax-utils';

interface PurchaseReturnViewProps {
    isOpen: boolean;
    onClose: () => void;
    data: PurchaseReturn;
}

interface PurchaseReturn {
    id: string;
    reference_no: string;
    supplier: string;
    date: string;
    total_amount: number;
    status: string;
    paid: number;
    due: number;
    notes?: string;
}

export function PurchaseReturnView({ isOpen, onClose, data }: PurchaseReturnViewProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Purchase Return Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Reference No</p>
                            <p className="text-sm">{data.reference_no}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Supplier</p>
                            <p className="text-sm">{data.supplier}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Date</p>
                            <p className="text-sm">{new Date(data.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(data.status)}`}>
                                {data.status}
                            </span>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                <p className="text-sm font-medium">{formatGHSCurrency(data.total_amount)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                                <p className="text-sm font-medium">{formatGHSCurrency(data.paid)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-500">Due Amount</p>
                                <p className="text-sm font-medium text-red-600">{formatGHSCurrency(data.due)}</p>
                            </div>
                        </div>
                    </div>

                    {data.notes && (
                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                            <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 