import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useChartOfAccounts } from '@/hooks/use-database';
import { formatCurrency } from '@/lib/utils';

interface JournalLineItem {
  id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

interface JournalEntryFormData {
  id?: string;
  entry_number: string;
  date: Date;
  reference: string;
  description: string;
  line_items: JournalLineItem[];
  status: 'draft' | 'posted' | 'cancelled';
}

interface JournalEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JournalEntryFormData) => Promise<void>;
  initialData?: Partial<JournalEntryFormData>;
  mode: 'create' | 'edit' | 'view';
}

export function JournalEntryForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  mode = 'create' 
}: JournalEntryFormProps) {
  const { data: accounts, loading: accountsLoading } = useChartOfAccounts({ realtime: false });
  
  const [formData, setFormData] = useState<JournalEntryFormData>({
    entry_number: '',
    date: new Date(),
    reference: '',
    description: '',
    line_items: [
      { id: '1', account_id: '', account_code: '', account_name: '', description: '', debit_amount: 0, credit_amount: 0 },
      { id: '2', account_id: '', account_code: '', account_name: '', description: '', debit_amount: 0, credit_amount: 0 }
    ],
    status: 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        line_items: initialData.line_items || prev.line_items
      }));
    } else {
      // Generate new entry number
      generateEntryNumber();
    }
  }, [initialData, isOpen]);

  const generateEntryNumber = () => {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    setFormData(prev => ({
      ...prev,
      entry_number: `JE-${year}-${String(sequence).padStart(4, '0')}`
    }));
  };

  const addLineItem = () => {
    const newId = String(formData.line_items.length + 1);
    setFormData(prev => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        { id: newId, account_id: '', account_code: '', account_name: '', description: '', debit_amount: 0, credit_amount: 0 }
      ]
    }));
  };

  const removeLineItem = (id: string) => {
    if (formData.line_items.length <= 2) {
      toast.error('Journal entry must have at least 2 line items');
      return;
    }
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter(item => item.id !== id)
    }));
  };

  const updateLineItem = (id: string, field: keyof JournalLineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // If account is selected, update account details
          if (field === 'account_id' && accounts) {
            const selectedAccount = accounts.find(acc => acc.id === value);
            if (selectedAccount) {
              updatedItem.account_code = selectedAccount.account_code;
              updatedItem.account_name = selectedAccount.account_name;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotals = () => {
    const totalDebits = formData.line_items.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
    const totalCredits = formData.line_items.reduce((sum, item) => sum + (item.credit_amount || 0), 0);
    return { totalDebits, totalCredits };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.entry_number.trim()) {
      newErrors.entry_number = 'Entry number is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate line items
    let hasValidLineItems = false;
    formData.line_items.forEach((item, index) => {
      if (item.account_id && (item.debit_amount > 0 || item.credit_amount > 0)) {
        hasValidLineItems = true;
        
        if (!item.description.trim()) {
          newErrors[`line_${index}_description`] = 'Line item description is required';
        }
        
        if (item.debit_amount > 0 && item.credit_amount > 0) {
          newErrors[`line_${index}_amount`] = 'Line item cannot have both debit and credit amounts';
        }
        
        if (item.debit_amount === 0 && item.credit_amount === 0) {
          newErrors[`line_${index}_amount`] = 'Line item must have either debit or credit amount';
        }
      }
    });

    if (!hasValidLineItems) {
      newErrors.line_items = 'At least two line items with amounts are required';
    }

    // Validate debits equal credits
    const { totalDebits, totalCredits } = calculateTotals();
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      newErrors.balance = `Total debits (${formatCurrency(totalDebits)}) must equal total credits (${formatCurrency(totalCredits)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      toast.success(`Journal entry ${mode === 'create' ? 'created' : 'updated'} successfully`);
      onClose();
    } catch (error) {
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} journal entry`);
      console.error('Error saving journal entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const { totalDebits, totalCredits } = calculateTotals();
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
  const isReadOnly = mode === 'view' || formData.status === 'posted';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Journal Entry' : 
             mode === 'edit' ? 'Edit Journal Entry' : 'View Journal Entry'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entry_number">Entry Number</Label>
              <Input
                id="entry_number"
                value={formData.entry_number}
                onChange={(e) => setFormData(prev => ({ ...prev, entry_number: e.target.value }))}
                disabled={isReadOnly}
                className={errors.entry_number ? 'border-red-500' : ''}
              />
              {errors.entry_number && <p className="text-red-500 text-sm mt-1">{errors.entry_number}</p>}
            </div>

            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isReadOnly}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                disabled={isReadOnly}
                placeholder="Optional reference"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isReadOnly}
              className={errors.description ? 'border-red-500' : ''}
              placeholder="Enter journal entry description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">Line Items</Label>
              {!isReadOnly && (
                <Button onClick={addLineItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </Button>
              )}
            </div>

            {errors.line_items && <p className="text-red-500 text-sm mb-2">{errors.line_items}</p>}

            <div className="space-y-2">
              {formData.line_items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg">
                  <div className="col-span-3">
                    <Select
                      value={item.account_id}
                      onValueChange={(value) => updateLineItem(item.id, 'account_id', value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className={errors[`line_${index}_account`] ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Line description"
                      disabled={isReadOnly}
                      className={errors[`line_${index}_description`] ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.debit_amount || ''}
                      onChange={(e) => updateLineItem(item.id, 'debit_amount', parseFloat(e.target.value) || 0)}
                      placeholder="Debit"
                      disabled={isReadOnly}
                      className={errors[`line_${index}_amount`] ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.credit_amount || ''}
                      onChange={(e) => updateLineItem(item.id, 'credit_amount', parseFloat(e.target.value) || 0)}
                      placeholder="Credit"
                      disabled={isReadOnly}
                      className={errors[`line_${index}_amount`] ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    {!isReadOnly && formData.line_items.length > 2 && (
                      <Button
                        onClick={() => removeLineItem(item.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {(errors[`line_${index}_description`] || errors[`line_${index}_amount`]) && (
                    <div className="col-span-12">
                      {errors[`line_${index}_description`] && (
                        <p className="text-red-500 text-sm">{errors[`line_${index}_description`]}</p>
                      )}
                      {errors[`line_${index}_amount`] && (
                        <p className="text-red-500 text-sm">{errors[`line_${index}_amount`]}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Debits: </span>
                  <span className="font-mono">{formatCurrency(totalDebits)}</span>
                </div>
                <div>
                  <span className="font-medium">Total Credits: </span>
                  <span className="font-mono">{formatCurrency(totalCredits)}</span>
                </div>
                <div className={`flex items-center ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {isBalanced ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                  <span className="font-medium">{isBalanced ? 'Balanced' : 'Out of Balance'}</span>
                </div>
              </div>
              {errors.balance && <p className="text-red-500 text-sm mt-2">{errors.balance}</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={saving || !isBalanced}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create Entry' : 'Update Entry'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
