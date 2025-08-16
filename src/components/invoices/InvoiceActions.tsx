import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { InvoicePDFGenerator, InvoiceEmailService } from '@/lib/invoice-utils';
import type { Invoice, Contact } from '@/lib/database';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Download,
  Send,
  Eye,
  Copy,
  FileText,
  Mail,
  Printer,
  Share,
  CheckCircle
} from 'lucide-react';

interface InvoiceActionsProps {
  invoice: Invoice;
  customer: Contact;
  onInvoiceUpdated?: (invoice: Invoice) => void;
}

interface EmailFormData {
  to: string;
  cc: string;
  subject: string;
  message: string;
  includeAttachment: boolean;
}

export function InvoiceActions({ invoice, customer, onInvoiceUpdated }: InvoiceActionsProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailFormData>({
    to: customer.email || '',
    cc: '',
    subject: `Invoice ${invoice.invoice_number} from Your Company`,
    message: InvoiceEmailService.getDefaultEmailBody(invoice, customer),
    includeAttachment: true
  });

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      toast.info('Generating PDF...');
      
      // Generate and download PDF
      InvoicePDFGenerator.downloadPDF(invoice, customer);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async () => {
    try {
      setLoading(true);
      toast.info('Opening invoice preview...');
      
      // Generate PDF for viewing
      const pdfUrl = await InvoicePDFGenerator.generatePDF(invoice, customer);
      
      // Open in new tab
      window.open(pdfUrl, '_blank');
      
      toast.success('Invoice opened in new tab');
    } catch (error) {
      console.error('Error viewing invoice:', error);
      toast.error('Failed to open invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    toast.info('Print functionality would open print dialog');
    // In a real implementation, you would:
    // 1. Generate PDF
    // 2. Open print dialog
    // 3. Or send to printer directly
    window.print();
  };

  const handleCopyInvoiceLink = () => {
    const invoiceUrl = `${window.location.origin}/invoices/${invoice.id}`;
    navigator.clipboard.writeText(invoiceUrl);
    toast.success('Invoice link copied to clipboard');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if (!emailForm.to.trim()) {
        toast.error('Recipient email is required');
        return;
      }

      // Parse CC emails
      const ccEmails = emailForm.cc
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      // Send email
      await InvoiceEmailService.sendInvoice(invoice, customer, {
        includeAttachment: emailForm.includeAttachment,
        customMessage: emailForm.message,
        ccEmails
      });

      // Update invoice status to 'sent' if it's currently draft
      if (invoice.status === 'draft') {
        const updatedInvoice = { ...invoice, status: 'sent' as const };
        onInvoiceUpdated?.(updatedInvoice);
      }

      toast.success('Invoice sent successfully');
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = () => {
    if (invoice.status !== 'paid') {
      const updatedInvoice = { ...invoice, status: 'paid' as const };
      onInvoiceUpdated?.(updatedInvoice);
      toast.success('Invoice marked as paid');
    }
  };

  const handleShareInvoice = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoice_number}`,
        text: `Invoice for ${customer.name}`,
        url: `${window.location.origin}/invoices/${invoice.id}`
      });
    } else {
      handleCopyInvoiceLink();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleViewInvoice} disabled={loading}>
            <Eye className="w-4 h-4 mr-2" />
            View Invoice
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDownloadPDF} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsEmailModalOpen(true)}>
            <Send className="w-4 h-4 mr-2" />
            Send Email
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handlePrintInvoice}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCopyInvoiceLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleShareInvoice}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </DropdownMenuItem>
          
          {invoice.status !== 'paid' && (
            <DropdownMenuItem onClick={handleMarkAsPaid}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Paid
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Invoice via Email</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="cc">CC (Optional)</Label>
                <Input
                  id="cc"
                  value={emailForm.cc}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, cc: e.target.value }))}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Invoice subject"
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Email message"
                rows={8}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeAttachment"
                checked={emailForm.includeAttachment}
                onCheckedChange={(checked) => 
                  setEmailForm(prev => ({ ...prev, includeAttachment: checked as boolean }))
                }
              />
              <Label htmlFor="includeAttachment" className="text-sm">
                Include PDF attachment
              </Label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Invoice Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Invoice:</span> {invoice.invoice_number}
                </div>
                <div>
                  <span className="text-gray-500">Customer:</span> {customer.name}
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span> {new Intl.NumberFormat('en-GH', {
                    style: 'currency',
                    currency: 'GHS'
                  }).format(invoice.total_amount)}
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span> {new Date(invoice.due_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEmailModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick action buttons for common actions
export function InvoiceQuickActions({ invoice, customer, onInvoiceUpdated }: InvoiceActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleQuickSend = async () => {
    try {
      setLoading(true);
      
      await InvoiceEmailService.sendInvoice(invoice, customer);
      
      // Update invoice status to 'sent' if it's currently draft
      if (invoice.status === 'draft') {
        const updatedInvoice = { ...invoice, status: 'sent' as const };
        onInvoiceUpdated?.(updatedInvoice);
      }
      
      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDownload = async () => {
    try {
      setLoading(true);
      InvoicePDFGenerator.downloadPDF(invoice, customer);
      toast.success('PDF downloaded');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {invoice.status === 'draft' && (
        <Button 
          size="sm" 
          onClick={handleQuickSend}
          disabled={loading}
        >
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
      )}
      
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleQuickDownload}
        disabled={loading}
      >
        <Download className="w-4 h-4 mr-1" />
        PDF
      </Button>
      
      <InvoiceActions 
        invoice={invoice} 
        customer={customer} 
        onInvoiceUpdated={onInvoiceUpdated} 
      />
    </div>
  );
}

export default InvoiceActions;