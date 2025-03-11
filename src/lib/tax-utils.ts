import { TAX_RATES } from './constants';

export interface TaxBreakdown {
    subtotal: number;
    vat: number;
    nhil: number;
    getfl: number;
    covid: number;
    total: number;
    withholdingTax?: number;
}

export function calculateTaxes(amount: number, includeWithholding: boolean = false, withholdingType: keyof typeof TAX_RATES.WITHHOLDING = 'STANDARD'): TaxBreakdown {
    const subtotal = amount;
    const vat = (subtotal * TAX_RATES.VAT) / 100;
    const nhil = (subtotal * TAX_RATES.NHIL) / 100;
    const getfl = (subtotal * TAX_RATES.GETFL) / 100;
    const covid = (subtotal * TAX_RATES.COVID) / 100;
    
    let withholdingTax = 0;
    if (includeWithholding) {
        withholdingTax = (subtotal * TAX_RATES.WITHHOLDING[withholdingType]) / 100;
    }

    const total = subtotal + vat + nhil + getfl + covid;

    return {
        subtotal,
        vat,
        nhil,
        getfl,
        covid,
        total,
        ...(includeWithholding && { withholdingTax })
    };
}

export function calculatePayrollTaxes(grossSalary: number) {
    // SSNIT Contribution calculation (13.5% employer, 5.5% employee)
    const employeeSsnit = (grossSalary * 5.5) / 100;
    const employerSsnit = (grossSalary * 13.5) / 100;

    // PAYE Tax Calculation (2024 rates)
    let payeTax = 0;
    let remainingSalary = grossSalary - employeeSsnit; // Taxable income after SSNIT

    const taxBrackets = [
        { threshold: 402, rate: 0 },
        { threshold: 110, rate: 5 },
        { threshold: 130, rate: 10 },
        { threshold: 3000, rate: 17.5 },
        { threshold: Infinity, rate: 25 }
    ];

    let currentSalary = remainingSalary;
    for (const bracket of taxBrackets) {
        if (currentSalary <= 0) break;
        
        const taxableAmount = Math.min(currentSalary, bracket.threshold);
        payeTax += (taxableAmount * bracket.rate) / 100;
        currentSalary -= bracket.threshold;
    }

    const netSalary = grossSalary - employeeSsnit - payeTax;

    return {
        grossSalary,
        employeeSsnit,
        employerSsnit,
        totalSsnit: employeeSsnit + employerSsnit,
        payeTax,
        netSalary
    };
}

export function formatGHSCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2
    }).format(amount);
}

export function calculateVATReturn(
    salesVAT: number,
    purchasesVAT: number,
    previousCredit: number = 0
): {
    vatPayable: number;
    vatCredit: number;
    netPosition: string;
} {
    const netVAT = salesVAT - purchasesVAT - previousCredit;
    
    return {
        vatPayable: netVAT > 0 ? netVAT : 0,
        vatCredit: netVAT < 0 ? Math.abs(netVAT) : 0,
        netPosition: netVAT > 0 ? 'PAYABLE' : 'CREDIT'
    };
}

export function calculateAnnualDepreciation(
    assetCost: number,
    salvageValue: number,
    usefulLife: number,
    method: 'straight-line' | 'reducing-balance' = 'straight-line',
    rate: number = 0
): number {
    if (method === 'straight-line') {
        return (assetCost - salvageValue) / usefulLife;
    } else {
        // Reducing balance method
        return (assetCost - salvageValue) * (rate / 100);
    }
} 