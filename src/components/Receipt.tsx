// components/Receipt.tsx
import { Printer, QrCodeIcon, X } from 'lucide-react';
import React from 'react';

interface ReceiptProps {
    ref: React.RefObject<HTMLDivElement>;
    invoiceNumber: string;
    poNumber: string;
    issuedDate: string;
    dueDate: string;
    from: {
        name: string;
        address: string;
    };
    to: {
        name: string;
        address: string;
    };
    items: { description: string; amount: number; qty: number; cost: number }[];
    subtotal: number;
    taxAmount: number;
    total: number;
    onClose: () => void; // Function to close the receipt
    onPrint: () => void; // Function to handle printing
}

const Receipt: React.FC<ReceiptProps> = ({
    ref,
    invoiceNumber,
    poNumber,
    issuedDate,
    dueDate,
    from = { name: 'Unknown', address: 'N/A' },
    to = { name: 'Unknown', address: 'N/A' },
    items = [],
    subtotal,
    taxAmount,
    total,
    onClose,
    onPrint,
}) => {
    const handlePrint = () => {
        onPrint(); // Trigger the print functionality
        window.print(); // Open the browser's print dialog
    };

    const extractInvoiceNumber = (id) => {
        const numericPart = Array.from(id)
          .filter(char => char >= '0' && char <= '9')
          .join('');
        // Remove the first six digits (assumed to be the date) and return the rest.
        return numericPart.slice(6);
    };

    return (
        <div ref={ref} className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="bg-white shadow-md rounded-lg max-w-6xl py-6 px-4 print:shadow-none">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Aseda Accounting</h3>
                    <button onClick={onClose} className="text-red-500 text-center flex align-middle justify-center outline-none border-none bg-transparent print:hidden">
                        <X size={20} />
                    </button>
                </div>

                {/* Invoice Info */}
                <div className="flex justify-between border-b-2 border-gray-300 py-2">
                    <p className="text-sm font-medium text-gray-800">Invoice {extractInvoiceNumber(invoiceNumber)}</p>
                    <p className="text-xs font-medium text-gray-800">{poNumber}</p>
                </div>

                {/* Dates */}
                <div className="flex justify-end py-2">
                    <div className="text-xs text-right">
                        <p>Date: <strong className='text-xs pl-2 font-medium text-gray-800'>{new Date(issuedDate).toLocaleDateString()}</strong></p>
                        <p>Due Date: <strong className='text-xs pl-2 font-medium text-gray-800'>{new Date(dueDate).toLocaleDateString()}</strong></p>
                    </div>
                </div>

                {/* From/To */}
                <div className="flex justify-between my-4">
                    <div>
                        <p className="font-semibold text-sm">From:</p>
                        <p className="text-xs">{from.name}</p>
                        <p className="text-xs">{from.address}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-right">To:</p>
                        <p className="text-xs text-right">{to.name}</p>
                        <p className="text-xs text-right">{to.address}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full my-4 mt-8">
                    <thead className="bg-blue-100">
                        <tr className='font-medium'>
                            <th className="text-center p-2 text-xs font-medium">Description</th>
                            <th className="text-center p-2 text-xs font-medium">Qty</th>
                            <th className="text-center p-2 text-xs font-medium">Price Per unit(GHS)</th>
                            <th className="text-center p-2 text-xs font-medium">Total(GHS)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="py-2 px-10 text-xs">{item.description}</td>
                                <td className="py-2 px-10 text-xs text-center">{item.qty}</td>
                                <td className="py-2 px-10 text-xs text-right">{(item.cost || 0).toFixed(2)}</td>
                                <td className="py-2 px-10 text-xs text-right">{(item.amount || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="text-right mt-6">
                    <p className="text-xs">Subtotal: <strong className='text-xs pl-4 font-medium text-gray-800'>{subtotal.toFixed(2)}</strong></p>
                    <p className="text-xs">Tax: <strong className='text-xs pl-4 font-medium text-gray-800'>{taxAmount.toFixed(2)}</strong></p>
                    <p className="text-xs">Total: <strong className='text-xs pl-4 font-medium text-gray-800'>{total.toFixed(2)}</strong></p>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-6 print:hidden">
                    <button 
                        onClick={handlePrint}
                        className="bg-transparent border-none outline-none text-gray-800 text-sm px-4 py-2 rounded flex items-center"
                    >
                        <Printer size={18} className="mr-2" />
                        Print
                    </button>
                    <QrCodeIcon size={58} />
                </div>
            </div>
        </div>
    );
};

export default Receipt;