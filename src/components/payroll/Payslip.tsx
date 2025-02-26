import { forwardRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { formatDate, formatCurrency } from '../utils/format';

interface PayslipProps {
	payroll: {
		id: number;
		employee: {
			first_name: string;
			last_name: string;
			employee_id: string;
		};
		pay_period_start: string;
		pay_period_end: string;
		gross_salary: number;
		deductions: number;
		net_salary: number;
		payment_date: string;
		payment_method: string;
	};
	onClose: () => void;
	onPrint: () => void;
}

const Payslip = forwardRef<HTMLDivElement, PayslipProps>(({ payroll, onClose, onPrint }, ref) => {
	const handlePrint = useReactToPrint({
		content: () => ref as React.MutableRefObject<HTMLDivElement>,
	});

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg w-full max-w-2xl">
				<div ref={ref} className="p-8 space-y-6">
					<div className="flex justify-between items-center border-b pb-4">
						<div>
							<h2 className="text-2xl font-bold text-gray-800">ACME Corporation</h2>
							<p className="text-gray-600">123 Business Street, Financial City</p>
						</div>
						<div className="text-right">
							<h3 className="text-xl font-semibold text-blue-600">PAYSLIP</h3>
							<p className="text-sm text-gray-600">#{String(payroll.id).padStart(5, '0')}</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div>
							<h4 className="font-semibold text-gray-700 mb-2">Employee Details</h4>
							<p className="text-gray-600">{payroll.employee.first_name} {payroll.employee.last_name}</p>
							<p className="text-gray-600">ID: {payroll.employee.employee_id}</p>
						</div>
						
						<div>
							<h4 className="font-semibold text-gray-700 mb-2">Payment Details</h4>
							<p className="text-gray-600">
								Paid on: {formatDate(payroll.payment_date)}
							</p>
							<p className="text-gray-600">
								Method: {payroll.payment_method}
							</p>
						</div>
					</div>

					<div className="border rounded-lg overflow-hidden">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
									<th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-t">
									<td className="py-3 px-4 text-gray-600">Gross Salary</td>
									<td className="py-3 px-4 text-right text-gray-600">
										{formatCurrency(payroll.gross_salary)}
									</td>
								</tr>
								<tr className="bg-red-50">
									<td className="py-3 px-4 text-red-600">Deductions</td>
									<td className="py-3 px-4 text-right text-red-600">
										-{formatCurrency(payroll.deductions)}
									</td>
								</tr>
								<tr className="border-t bg-blue-50">
									<td className="py-3 px-4 font-semibold text-blue-600">Net Pay</td>
									<td className="py-3 px-4 text-right font-semibold text-blue-600">
										{formatCurrency(payroll.net_salary)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="text-center text-sm text-gray-500 mt-8">
						Pay Period: {formatDate(payroll.pay_period_start)} - {formatDate(payroll.pay_period_end)}
					</div>
				</div>

				<div className="flex justify-end gap-4 mt-6">
					<button
						onClick={handlePrint}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
					>
						Print Payslip
					</button>
					<button
						onClick={onClose}
						className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
});

export default Payslip;