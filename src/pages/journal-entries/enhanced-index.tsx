import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useJournalEntries } from '@/hooks/use-database';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { JournalEntry } from '@/lib/database';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

interface JournalEntryLine {
  id: string;
  account_code: string;
  account_name: string;
  description: string;
  debit: number;
  credit: number;
}

export default function JournalEntriesPage() {
  const { hasPermission } = useAuth();
  const {
    data: journalEntries,
    loading,
    error,
    createJournalEntry,
    update,
    delete: deleteJournalEntry,
    searchData,
    refresh
  } = useJournalEntries({ realtime: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    entry_number: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    status: 'draft' as 'draft' | 'posted' | 'cancelled'
  });

  const [lineItems, setLineItems] = useState<JournalEntryLine[]>([
    { id: '1', account_code: '', account_name: '', description: '', debit: 0, credit: 0 }
  ]);

  // Handle search and filtering
  useEffect(() => {
    if (searchQuery.trim()) {
      searchData(searchQuery);
    } else {
      refresh();
    }
  }, [searchQuery, searchData, refresh]);

  // Calculate totals
  const totalDebit = lineItems.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalCredit = lineItems.reduce((sum, item) => sum + (item.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Filter entries
  const filteredEntries = journalEntries?.filter(entry => {
    if (statusFilter === 'all') return true;
    return entry.status === statusFilter;
  }) || [];

  // Reset form
  const resetForm = () => {
    setFormData({
      entry_number: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      status: 'draft'
    });
    setLineItems([
      { id: '1', account_code: '', account_name: '', description: '', debit: 0, credit: 0 }
    ]);
  };

  // Handle line item changes
  const updateLineItem = (id: string, field: keyof JournalEntryLine, value: any) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Add new line item
  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems(prev => [...prev, {
      id: newId,
      account_code: '',
      account_name: '',
      description: '',
      debit: 0,
      credit: 0
    }]);
  };

  // Remove line item
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle create journal entry
  const handleCreateJournalEntry = async () => {
    if (!isBalanced) {
      alert('Total debits must equal total credits');
      return;
    }

    try {
      const entryData = {
        ...formData,
        total_debit: totalDebit,
        total_credit: totalCredit,
        line_items: lineItems.filter(item => item.account_code && (item.debit > 0 || item.credit > 0))
      };

      await createJournalEntry(entryData);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  // Handle edit journal entry
  const handleEditJournalEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setFormData({
      entry_number: entry.entry_number,
      date: entry.date,
      reference: entry.reference || '',
      description: entry.description,
      status: entry.status
    });
    // Note: Line items would need to be loaded from journal_entry_lines table
    setIsEditModalOpen(true);
  };

  // Handle post journal entry
  const handlePostJournalEntry = async (entry: JournalEntry) => {
    if (entry.status === 'posted') return;
    
    try {
      await update(entry.id, { 
        status: 'posted', 
        posted_at: new Date().toISOString(),
        posted_by: 'current_user' // This should be the actual user ID
      });
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  // Handle delete with confirmation
  const handleDeleteJournalEntry = async (entry: JournalEntry) => {
    if (entry.status === 'posted') {
      alert('Cannot delete posted journal entries');
      return;
    }

    if (window.confirm(`Are you sure you want to delete journal entry ${entry.entry_number}?`)) {
      try {
        await deleteJournalEntry(entry.id);
      } catch (error) {
        // Error is already handled by the hook
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'posted':
        return <Badge variant="default" className="bg-green-100 text-green-800">Posted</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const entryStats = {
    total: filteredEntries.length,
    draft: filteredEntries.filter(e => e.status === 'draft').length,
    posted: filteredEntries.filter(e => e.status === 'posted').length,
    totalAmount: filteredEntries.reduce((sum, e) => sum + e.total_debit, 0)
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading journal entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Journal Entries</h1>
          <p className="text-muted-foreground">Record and manage double-entry journal transactions</p>
        </div>
        
        {hasPermission('journal_entries:write') && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Journal Entry
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entryStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {entryStats.posted} posted entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Entries</CardTitle>
            <Edit className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{entryStats.draft}</div>
            <p className="text-xs text-muted-foreground">
              Pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted Entries</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{entryStats.posted}</div>
            <p className="text-xs text-muted-foreground">
              Final entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(entryStats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total debits/credits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
          <CardDescription>
            {filteredEntries.length} entries found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.entry_number}
                    </TableCell>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{entry.description}</div>
                    </TableCell>
                    <TableCell>{entry.reference || '-'}</TableCell>
                    <TableCell>{formatCurrency(entry.total_debit)}</TableCell>
                    <TableCell>{formatCurrency(entry.total_credit)}</TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {entry.status === 'draft' && hasPermission('journal_entries:write') && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditJournalEntry(entry)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handlePostJournalEntry(entry)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {entry.status !== 'posted' && hasPermission('journal_entries:delete') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteJournalEntry(entry)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No journal entries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first journal entry to get started'
                }
              </p>
              {hasPermission('journal_entries:write') && !searchQuery && statusFilter === 'all' && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Journal Entry
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Journal Entry Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Journal Entry</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry_number">Entry Number</Label>
                <Input
                  id="entry_number"
                  value={formData.entry_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_number: e.target.value }))}
                  placeholder="JE-2024-001"
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Invoice #123, Payment Receipt..."
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'draft' | 'posted' | 'cancelled') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the transaction..."
                  rows={2}
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-base font-medium">Journal Lines</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.account_code}
                            onChange={(e) => updateLineItem(item.id, 'account_code', e.target.value)}
                            placeholder="1000"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.account_name}
                            onChange={(e) => updateLineItem(item.id, 'account_name', e.target.value)}
                            placeholder="Cash"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder="Line description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.debit || ''}
                            onChange={(e) => updateLineItem(item.id, 'debit', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.credit || ''}
                            onChange={(e) => updateLineItem(item.id, 'credit', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Debit: </span>
                    <span className="text-green-600">{formatCurrency(totalDebit)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Credit: </span>
                    <span className="text-blue-600">{formatCurrency(totalCredit)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Balance: </span>
                    {isBalanced ? (
                      <span className="text-green-600 ml-2 flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        Balanced
                      </span>
                    ) : (
                      <span className="text-red-600 ml-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Out of Balance ({formatCurrency(Math.abs(totalDebit - totalCredit))})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateJournalEntry} disabled={!isBalanced}>
              Create Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}