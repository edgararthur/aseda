import { useState } from 'react';
import { toast } from 'react-toastify';
import supabase from '@/lib/supabase';
import { X } from 'lucide-react';

interface Employee {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
}

interface PayrollFormProps {
	employees: Employee[];
	onSubmit: (data: any) => Promise<void>;
	onClose: () => void;
}

export const PayrollForm = ({ employees, onSubmit, onClose }: PayrollFormProps) => {
	const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
	const [basicSalary, setBasicSalary] = useState<number | string>('');
	const [status, setStatus] = useState<'Paid' | 'Unpaid'>('Paid');
	const [hraAllowance, setHraAllowance] = useState<number | string>('');
	const [conveyance, setConveyance] = useState<number | string>('');
	const [medicalAllowance, setMedicalAllowance] = useState<number | string>('');
	const [bonus, setBonus] = useState<number | string>('');
	const [pf, setPf] = useState<number | string>('');
	const [professionalTax, setProfessionalTax] = useState<number | string>('');
	const [tds, setTds] = useState<number | string>('');
	const [loansOthers, setLoansOthers] = useState<number | string>('');
	const [othersDeductions, setOthersDeductions] = useState<number | string>('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedEmployee || !basicSalary || !hraAllowance || !conveyance || !medicalAllowance || !bonus || !pf || !professionalTax || !tds || !loansOthers) {
			toast.error('Please fill in all required fields.');
			return;
		}

		const payrollData = {
			employee_id: selectedEmployee,
			basic_salary: Number(basicSalary),
			status,
			allowances: {
				hra: Number(hraAllowance),
				conveyance: Number(conveyance),
				medical: Number(medicalAllowance),
				bonus: Number(bonus),
			},
			deductions: {
				pf: Number(pf),
				professional_tax: Number(professionalTax),
				tds: Number(tds),
				loans_others: Number(loansOthers),
				others: Number(othersDeductions),
			},
		};

		try {
			await onSubmit(payrollData);
			toast.success('Payroll submitted successfully!');
			onClose();
		} catch (error) {
			toast.error('Failed to submit payroll.');
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg w-auto max-w-max">
				<div className="flex align-middle justify-between border-b border-gray-300">
					<h2 className="text-sm font-semibold pb-4 text-gray-800">Add Payroll</h2>
					<button onClick={onClose} className="text-gray-700 bg-transparent rounded flex items-center mr-2 border-none">
						<X className='text-white bg-red-400 rounded-full p-1 w-5 h-5' />
					</button>
				</div>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label className="block text-xs font-medium text-gray-800">Select Employee <span className="text-red-500 text-lg">*</span></label>
						<select
							value={selectedEmployee || ''}
							onChange={(e) => setSelectedEmployee(Number(e.target.value))}
							className="mt-1 block w-56 border border-gray-300 bg-transparent text-xs font-medium text-gray-800 rounded-md shadow-sm p-2 focus:bg-transparent outline-none"
							required
						>
							<option value="">Select</option>
							{employees.map((employee) => (
								<option key={employee.id} value={employee.id}>
									{employee.first_name} {employee.last_name}
								</option>
							))}
						</select>
					</div>

					<h3 className="text-md font-semibold mb-2">Salary Information</h3>
					<div className="mb-4">
						<label className="block text-xs font-medium text-gray-800">Base Salary <span className="text-red-500 text-lg">*</span></label>
						<input
							type="number"
							value={basicSalary}
							onChange={(e) => setBasicSalary(e.target.value)}
							className="mt-1 block w-full border p-2 bg-transparent text-xs font-medium text-gray-800 border-gray-300 rounded-md shadow-sm outline-none"
							required
						/>
					</div>

					<div className="mb-4">
						<label className="block text-xs font-medium text-gray-800">Status <span className="text-red-500 text-lg">*</span></label>
						<div className="flex items-center">
							<input
								type="checkbox"
								value="Paid"
								checked={status === 'Paid'}
								onChange={() => setStatus('Paid')}
								className="mr-2 text-xs bg-transparent border-none"
							/>
							<label className="mr-4 text-xs">Paid</label>
							<input
								type="checkbox"
								value="Unpaid"
								checked={status === 'Unpaid'}
								onChange={() => setStatus('Unpaid')}
								className="mr-2 text-xs bg-transparent border-none"
							/>
							<label className="text-xs">Unpaid</label>
						</div>
					</div>

					<h3 className="text-sm font-semibold mb-2">Allowances</h3>
					<div className="flex align-middle gap-4 mb-4">
						<div>
							<label className="block text-xs  font-medium text-gray-700">HRA Allowance *</label>
							<input
								type="number"
								value={hraAllowance}
								onChange={(e) => setHraAllowance(e.target.value)}
								className="mt-1 block w-full p-2 bg-transparent outline-none border border-gray-300 rounded-md shadow-xs text-xs"
								required
							/>
						</div>
						<div>
							<label className="block text-xs  font-medium text-gray-700">Conveyance *</label>
							<input
								type="number"
								value={conveyance}
								onChange={(e) => setConveyance(e.target.value)}
								className="mt-1 block w-full p-2 bg-transparent outline-none border border-gray-300 rounded-md shadow-xs text-xs"
								required
							/>
						</div>
						<div>
							<label className="block text-xs  font-medium text-gray-700">Medical Allowance *</label>
							<input
								type="number"
								value={medicalAllowance}
								onChange={(e) => setMedicalAllowance(e.target.value)}
								className="mt-1 block w-full border p-2 bg-transparent outline-none border-gray-300 rounded-md shadow-xs text-xs"
								required
							/>
						</div>
						<div>
							<label className="block text-xs  font-medium text-gray-700">Bonus *</label>
							<input
								type="number"
								value={bonus}
								onChange={(e) => setBonus(e.target.value)}
								className="mt-1 block w-full border p-2 bg-transparent outline-none border-gray-300 rounded-md shadow-xs text-xs"
								required
							/>
						</div>
						<div className="col-span-2">
							<label className="block text-xs  font-medium text-gray-700">Others</label>
							<input
								type="text"
								value={othersDeductions}
								onChange={(e) => setOthersDeductions(e.target.value)}
								className="mt-1 block w-full border p-1 bg-transparent outline-none border-gray-300 rounded-md shadow-xs "
							/>
						</div>
					</div>

					<h3 className="text-md font-semibold mb-2">Deductions</h3>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">PAYE (Personal Income Tax)</label>
							<input
								type="number"
								value={pf}
								onChange={(e) => setPf(e.target.value)}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">SSNIT (Social Security and National Insurance Trust)  *</label>
							<input
								type="number"
								value={professionalTax}
								onChange={(e) => setProfessionalTax(e.target.value)}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
								required
							/>
						</div>
						<div className="col-span-2">
							<label className="block text-sm font-medium text-gray-700">Others</label>
							<input
								type="text"
								value={othersDeductions}
								onChange={(e) => setOthersDeductions(e.target.value)}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
							/>
						</div>
					</div>

					<div className="mt-6 flex justify-end gap-4">
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};