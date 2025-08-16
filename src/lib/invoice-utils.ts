import { formatCurrency } from '@/lib/utils';
import type { Invoice, Contact } from '@/lib/database';

// Invoice PDF generation utility
export class InvoicePDFGenerator {
  static async generatePDF(invoice: Invoice, customer: Contact, lineItems: any[] = []) {
    // For now, we'll simulate PDF generation
    // In a real implementation, you would use libraries like jsPDF or react-pdf
    
    const pdfContent = {
      invoice_number: invoice.invoice_number,
      customer: customer.name,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      total_amount: invoice.total_amount,
      line_items: lineItems,
      company_info: {
        name: 'Your Company Name',
        address: '123 Business Street',
        city: 'Business City',
        phone: '+233 24 000 0000',
        email: 'info@yourcompany.com'
      }
    };

    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a blob URL for download simulation
    const blob = new Blob([JSON.stringify(pdfContent, null, 2)], { 
      type: 'application/json' 
    });
    return URL.createObjectURL(blob);
  }

  static downloadPDF(invoice: Invoice, customer: Contact) {
    // Simulate PDF download
    const element = document.createElement('a');
    element.href = `data:text/plain;charset=utf-8,Invoice: ${invoice.invoice_number}\nCustomer: ${customer.name}\nAmount: ${formatCurrency(invoice.total_amount)}`;
    element.download = `invoice-${invoice.invoice_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

// Email service utility
export class InvoiceEmailService {
  static async sendInvoice(invoice: Invoice, customer: Contact, options: {
    includeAttachment?: boolean;
    customMessage?: string;
    ccEmails?: string[];
  } = {}) {
    // Simulate email sending
    const emailData = {
      to: customer.email,
      cc: options.ccEmails || [],
      subject: `Invoice ${invoice.invoice_number} from Your Company`,
      body: options.customMessage || this.getDefaultEmailBody(invoice, customer),
      attachment: options.includeAttachment ? `invoice-${invoice.invoice_number}.pdf` : null
    };

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Email sent:', emailData);
    return { success: true, messageId: `msg-${Date.now()}` };
  }

  static getDefaultEmailBody(invoice: Invoice, customer: Contact) {
    return `
Dear ${customer.name},

Please find attached invoice ${invoice.invoice_number} for ${formatCurrency(invoice.total_amount)}.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}
- Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
- Amount Due: ${formatCurrency(invoice.total_amount)}

Payment can be made via:
- Bank Transfer: [Bank Details]
- Mobile Money: [Mobile Money Details]
- Cash: Visit our office

Thank you for your business!

Best regards,
Your Company Team
    `.trim();
  }

  static async sendPaymentReminder(invoice: Invoice, customer: Contact, daysOverdue: number) {
    const emailData = {
      to: customer.email,
      subject: `Payment Reminder - Invoice ${invoice.invoice_number}`,
      body: `
Dear ${customer.name},

This is a friendly reminder that invoice ${invoice.invoice_number} for ${formatCurrency(invoice.total_amount)} is now ${daysOverdue} days overdue.

Original Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
Amount Due: ${formatCurrency(invoice.total_amount)}

Please arrange payment at your earliest convenience. If you have already made payment, please disregard this reminder.

If you have any questions, please don't hesitate to contact us.

Best regards,
Your Company Team
      `.trim()
    };

    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Payment reminder sent:', emailData);
    return { success: true, messageId: `reminder-${Date.now()}` };
  }
}

// Payment tracking utility
export class PaymentTracker {
  static calculateDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  static getPaymentStatus(invoice: Invoice): {
    status: 'current' | 'due_soon' | 'overdue' | 'paid';
    daysOverdue: number;
    message: string;
  } {
    if (invoice.status === 'paid') {
      return {
        status: 'paid',
        daysOverdue: 0,
        message: 'Payment received'
      };
    }

    const daysOverdue = this.calculateDaysOverdue(invoice.due_date);
    const daysUntilDue = -daysOverdue;

    if (daysOverdue > 0) {
      return {
        status: 'overdue',
        daysOverdue,
        message: `${daysOverdue} days overdue`
      };
    } else if (daysUntilDue <= 7) {
      return {
        status: 'due_soon',
        daysOverdue: 0,
        message: `Due in ${daysUntilDue} days`
      };
    } else {
      return {
        status: 'current',
        daysOverdue: 0,
        message: `Due ${new Date(invoice.due_date).toLocaleDateString()}`
      };
    }
  }

  static async recordPayment(invoiceId: string, paymentData: {
    amount: number;
    method: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
    reference?: string;
    notes?: string;
    date: string;
  }) {
    // Simulate payment recording
    const payment = {
      id: `payment-${Date.now()}`,
      invoice_id: invoiceId,
      ...paymentData,
      created_at: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Payment recorded:', payment);
    return payment;
  }
}

// Invoice numbering utility
export class InvoiceNumberGenerator {
  static generate(options: {
    prefix?: string;
    year?: number;
    sequence?: number;
    format?: 'simple' | 'yearly' | 'monthly';
  } = {}): string {
    const {
      prefix = 'INV',
      year = new Date().getFullYear(),
      sequence = 1,
      format = 'yearly'
    } = options;

    switch (format) {
      case 'simple':
        return `${prefix}-${String(sequence).padStart(6, '0')}`;
      
      case 'monthly':
        const month = new Date().getMonth() + 1;
        return `${prefix}-${year}-${String(month).padStart(2, '0')}-${String(sequence).padStart(4, '0')}`;
      
      case 'yearly':
      default:
        return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
    }
  }

  static parseInvoiceNumber(invoiceNumber: string): {
    prefix: string;
    year?: number;
    month?: number;
    sequence: number;
  } | null {
    // Parse INV-2024-0001 format
    const yearlyMatch = invoiceNumber.match(/^([A-Z]+)-(\d{4})-(\d+)$/);
    if (yearlyMatch) {
      return {
        prefix: yearlyMatch[1],
        year: parseInt(yearlyMatch[2]),
        sequence: parseInt(yearlyMatch[3])
      };
    }

    // Parse INV-2024-03-0001 format
    const monthlyMatch = invoiceNumber.match(/^([A-Z]+)-(\d{4})-(\d{2})-(\d+)$/);
    if (monthlyMatch) {
      return {
        prefix: monthlyMatch[1],
        year: parseInt(monthlyMatch[2]),
        month: parseInt(monthlyMatch[3]),
        sequence: parseInt(monthlyMatch[4])
      };
    }

    // Parse INV-000001 format
    const simpleMatch = invoiceNumber.match(/^([A-Z]+)-(\d+)$/);
    if (simpleMatch) {
      return {
        prefix: simpleMatch[1],
        sequence: parseInt(simpleMatch[2])
      };
    }

    return null;
  }
}

// Invoice validation utility
export class InvoiceValidator {
  static validateInvoiceData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.invoice_number || data.invoice_number.trim() === '') {
      errors.push('Invoice number is required');
    }

    if (!data.contact_id) {
      errors.push('Customer is required');
    }

    if (!data.issue_date) {
      errors.push('Issue date is required');
    }

    if (!data.due_date) {
      errors.push('Due date is required');
    }

    if (data.issue_date && data.due_date && new Date(data.due_date) < new Date(data.issue_date)) {
      errors.push('Due date cannot be before issue date');
    }

    if (!data.line_items || data.line_items.length === 0) {
      errors.push('At least one line item is required');
    }

    if (data.line_items) {
      data.line_items.forEach((item: any, index: number) => {
        if (!item.description || item.description.trim() === '') {
          errors.push(`Line item ${index + 1}: Description is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
        }
        if (!item.unit_price || item.unit_price < 0) {
          errors.push(`Line item ${index + 1}: Unit price cannot be negative`);
        }
      });
    }

    if (data.total_amount && data.total_amount <= 0) {
      errors.push('Total amount must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePaymentData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (!data.method) {
      errors.push('Payment method is required');
    }

    if (!data.date) {
      errors.push('Payment date is required');
    }

    if (data.method === 'cheque' && (!data.reference || data.reference.trim() === '')) {
      errors.push('Cheque number is required for cheque payments');
    }

    if (data.method === 'bank_transfer' && (!data.reference || data.reference.trim() === '')) {
      errors.push('Transaction reference is required for bank transfers');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Invoice statistics utility
export class InvoiceStats {
  static calculateStats(invoices: Invoice[]): {
    total: number;
    paid: number;
    overdue: number;
    draft: number;
    totalValue: number;
    paidValue: number;
    overdueValue: number;
    averagePaymentTime: number;
    conversionRate: number;
  } {
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const overdue = invoices.filter(inv => {
      return inv.status !== 'paid' && new Date(inv.due_date) < new Date();
    }).length;
    const draft = invoices.filter(inv => inv.status === 'draft').length;

    const totalValue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidValue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    const overdueValue = invoices
      .filter(inv => inv.status !== 'paid' && new Date(inv.due_date) < new Date())
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    // Calculate average payment time (mock calculation)
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const averagePaymentTime = paidInvoices.length > 0 
      ? paidInvoices.reduce((sum, inv) => {
          const daysToPay = Math.ceil(
            (new Date().getTime() - new Date(inv.issue_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + daysToPay;
        }, 0) / paidInvoices.length
      : 0;

    const sentInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'paid');
    const conversionRate = sentInvoices.length > 0 ? (paid / sentInvoices.length) * 100 : 0;

    return {
      total,
      paid,
      overdue,
      draft,
      totalValue,
      paidValue,
      overdueValue,
      averagePaymentTime,
      conversionRate
    };
  }

  static getTopCustomers(invoices: Invoice[], contacts: Contact[], limit: number = 5): Array<{
    customer: Contact;
    totalInvoices: number;
    totalValue: number;
    paidValue: number;
  }> {
    const customerStats = new Map();

    invoices.forEach(invoice => {
      const customerId = invoice.contact_id;
      if (!customerStats.has(customerId)) {
        customerStats.set(customerId, {
          totalInvoices: 0,
          totalValue: 0,
          paidValue: 0
        });
      }

      const stats = customerStats.get(customerId);
      stats.totalInvoices += 1;
      stats.totalValue += invoice.total_amount;
      if (invoice.status === 'paid') {
        stats.paidValue += invoice.total_amount;
      }
    });

    return Array.from(customerStats.entries())
      .map(([customerId, stats]) => ({
        customer: contacts.find(c => c.id === customerId)!,
        ...stats
      }))
      .filter(item => item.customer)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit);
  }
}