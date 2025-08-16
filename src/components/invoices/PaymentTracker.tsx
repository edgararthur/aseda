import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaymentTracker, InvoiceEmailService } from '@/lib/invoice-utils';
import { formatCurrency } from '@/lib/utils';
import type { Invoice, Contact } from '@/lib/database';
import { toast } from 'sonner';
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Send,
  Download,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
  reference?: string;
  notes?: string;
  date: string;
  created_at: string;
}

interface PaymentTrackerProps {
  invoice: Invoice;
  customer: Contact;
  onPaymentRecorded?: (payment: Payment) => void;
  onInvoiceUpdated?: (invoice: Invoice) => void;
}

interface PaymentFormData {
  amount: number;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
  reference: string;
  notes: string;
  date: string;
}

export function PaymentTrackerComponent({ invoice, customer, onPaymentRecorded, onInvoiceUpdated }: PaymentTrackerProps) {
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminderMessage, setReminderMessage] = useState('');

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amount: invoice.total_amount,
    method: 'bank_transfer',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const paymentStatus = PaymentTracker.getPaymentStatus(invoice);
  const remainingBalance = invoice.total_amount - payments.reduce((sum, p) => sum + p.amount, 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Validate payment amount
      if (paymentForm.amount <= 0) {
        toast.error('Payment amount must be greater than 0');
        return;
      }

      if (paymentForm.amount > remainingBalance) {
        toast.error('Payment amount cannot exceed remaining balance');
        return;
      }

      // Record payment
      const payment = await PaymentTracker.recordPayment(invoice.id, paymentForm);
      
      // Add to local payments list
      setPayments(prev => [...prev, payment as Payment]);
      
      // Check if invoice is fully paid
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0) + paymentForm.amount;
      const isFullyPaid = totalPaid >= invoice.total_amount;

      if (isFullyPaid) {
        const updatedInvoice = { ...invoice, status: 'paid' as const };
        onInvoiceUpdated?.(updatedInvoice);
        toast.success('Payment recorded and invoice marked as paid!');
      } else {
        toast.success('Partial payment recorded successfully');
      }

      onPaymentRecorded?.(payment as Payment);
      setIsRecordPaymentOpen(false);
      resetPaymentForm();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      setLoading(true);
      
      const daysOverdue = PaymentTracker.calculateDaysOverdue(invoice.due_date);
      
      if (reminderMessage.trim()) {
        // Send custom reminder
        await InvoiceEmailService.sendInvoice(invoice, customer, {
          customMessage: reminderMessage
        });
      } else {
        // Send default payment reminder
        await InvoiceEmailService.sendPaymentReminder(invoice, customer, daysOverdue);
      }

      toast.success('Payment reminder sent successfully');
      setIsSendReminderOpen(false);
      setReminderMessage('');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send payment reminder');
    } finally {
      setLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: remainingBalance,
      method: 'bank_transfer',
      reference: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusBadge = () => {
    switch (paymentStatus.status) {
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {paymentStatus.message}
          </Badge>
        );
      case 'due_soon':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            {paymentStatus.message}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Calendar className="w-3 h-3 mr-1" />
            {paymentStatus.message}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Status
            </span>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Invoice Total</Label>
              <p className="text-lg font-bold">{formatCurrency(invoice.total_amount)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Amount Paid</Label>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Remaining Balance</Label>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(remainingBalance)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Due Date</Label>
              <p className="text-lg font-medium">
                {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {remainingBalance > 0 && (
              <Button onClick={() => setIsRecordPaymentOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            )}
            
            {paymentStatus.status === 'overdue' && (
              <Button variant="outline" onClick={() => setIsSendReminderOpen(true)}>
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              {payments.length} payment(s) recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.method.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.reference || '-'}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {payment.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Record Payment Modal */}
      <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={remainingBalance}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ 
                  ...prev, 
                  amount: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(remainingBalance)}
              </p>
            </div>

            <div>
              <Label htmlFor="method">Payment Method *</Label>
              <Select
                value={paymentForm.method}
                onValueChange={(value: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque') =>
                  setPaymentForm(prev => ({ ...prev, method: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Payment Date *</Label>
              <Input
                id="date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="reference">
                Reference/Transaction ID
                {(paymentForm.method === 'cheque' || paymentForm.method === 'bank_transfer') && ' *'}
              </Label>
              <Input
                id="reference"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                placeholder={
                  paymentForm.method === 'cheque' ? 'Cheque number' :
                  paymentForm.method === 'bank_transfer' ? 'Transaction reference' :
                  paymentForm.method === 'mobile_money' ? 'Transaction ID' :
                  'Reference number'
                }
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional payment notes..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsRecordPaymentOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Modal */}
      <Dialog open={isSendReminderOpen} onOpenChange={setIsSendReminderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Customer</Label>
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>

            <div>
              <Label>Invoice Details</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p><strong>Invoice:</strong> {invoice.invoice_number}</p>
                <p><strong>Amount:</strong> {formatCurrency(invoice.total_amount)}</p>
                <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                <p><strong>Days Overdue:</strong> {paymentStatus.daysOverdue}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="reminderMessage">Custom Message (Optional)</Label>
              <Textarea
                id="reminderMessage"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Leave empty to use default reminder message..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSendReminderOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSendReminder} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PaymentTrackerComponent;