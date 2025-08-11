import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { DataTableTemplate, Column } from '@/components/common/DataTableTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BookOpen, Plus, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { offlineStorage } from '@/lib/offline-storage';

interface JournalEntry {
    id: string;
    date: string;
  reference: string;
  description: string;
  status: 'draft' | 'posted' | 'reviewed';
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  createdAt: string;
  lineItems: JournalLineItem[];
}

interface JournalLineItem {
  id: string;
  accountCode: string;
  accountName: string;
    description: string;
  debit: number;
  credit: number;
}

interface JournalStats {
  totalEntries: number;
  draftEntries: number;
  postedEntries: number;
  totalDebits: number;
  totalCredits: number;
}

export default function JournalEntriesPage() {
  const { hasPermission } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats>({
    totalEntries: 0,
    draftEntries: 0,
    postedEntries: 0,
    totalDebits: 0,
    totalCredits: 0
  });
    const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState<JournalLineItem[]>([
    { id: '1', accountCode: '', accountName: '', description: '', debit: 0, credit: 0 }
  ]);

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

    const fetchEntries = async () => {
        try {
      // Mock journal entries data
      const mockEntries: JournalEntry[] = [
        {
          id: '1',
          date: '2024-01-15',
          reference: 'JE-001',
          description: 'Office equipment purchase',
          status: 'posted',
          totalDebit: 5000,
          totalCredit: 5000,
          createdBy: 'John Doe',
          createdAt: '2024-01-15T10:00:00Z',
          lineItems: [
            { id: '1', accountCode: '1200', accountName: 'Office Equipment', description: 'Computer purchase', debit: 5000, credit: 0 },
            { id: '2', accountCode: '1000', accountName: 'Cash', description: 'Payment for computer', debit: 0, credit: 5000 }
          ]
        },
        {
          id: '2',
          date: '2024-01-16',
          reference: 'JE-002',
          description: 'Monthly rent expense',
          status: 'draft',
          totalDebit: 2500,
          totalCredit: 2500,
          createdBy: 'Jane Smith',
          createdAt: '2024-01-16T14:30:00Z',
          lineItems: [
            { id: '3', accountCode: '5100', accountName: 'Rent Expense', description: 'January rent', debit: 2500, credit: 0 },
            { id: '4', accountCode: '2000', accountName: 'Accounts Payable', description: 'Rent payable', debit: 0, credit: 2500 }
          ]
        }
      ];

      setEntries(mockEntries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to fetch journal entries');
        } finally {
            setLoading(false);
        }
    };

  const fetchStats = async () => {
    const mockStats: JournalStats = {
      totalEntries: 45,
      draftEntries: 8,
      postedEntries: 37,
      totalDebits: 125000,
      totalCredits: 125000
    };
    setStats(mockStats);
  };

  const handleAdd = () => {
    setCurrentEntry(null);
    setEntryDate(new Date());
    setReference('');
    setDescription('');
    setLineItems([
      { id: '1', accountCode: '', accountName: '', description: '', debit: 0, credit: 0 }
    ]);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setEntryDate(new Date(entry.date));
    setReference(entry.reference);
    setDescription(entry.description);
    setLineItems(entry.lineItems);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const totalDebit = lineItems.reduce((sum, item) => sum + item.debit, 0);
      const totalCredit = lineItems.reduce((sum, item) => sum + item.credit, 0);

      if (totalDebit !== totalCredit) {
        toast.error('Total debits must equal total credits');
        return;
      }

      const entryData = {
        id: currentEntry?.id || Date.now().toString(),
        date: format(entryDate, 'yyyy-MM-dd'),
        reference,
        description,
        status: 'draft' as const,
        totalDebit,
        totalCredit,
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        lineItems
      };

      if (currentEntry) {
        setEntries(prev => prev.map(e => e.id === currentEntry.id ? { ...entryData, id: currentEntry.id } : e));
        toast.success('Journal entry updated successfully');
      } else {
        setEntries(prev => [...prev, entryData]);
        toast.success('Journal entry created successfully');
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save journal entry');
    }
  };

  const handlePost = async (entryId: string) => {
    try {
      setEntries(prev => 
        prev.map(e => 
          e.id === entryId 
            ? { ...e, status: 'posted' as const }
            : e
        )
      );
      toast.success('Journal entry posted successfully');
    } catch (error) {
      toast.error('Failed to post journal entry');
    }
  };

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems(prev => [...prev, {
      id: newId,
      accountCode: '',
      accountName: '',
      description: '',
      debit: 0,
      credit: 0
    }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Posted</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800"><XCircle className="w-3 h-3 mr-1" />Reviewed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column[] = [
    {
      key: 'reference',
      label: 'Reference',
      render: (entry) => entry.reference
    },
    {
      key: 'date',
      label: 'Date',
      render: (entry) => new Date(entry.date).toLocaleDateString()
    },
    {
      key: 'description',
      label: 'Description',
      render: (entry) => entry.description
    },
    {
      key: 'totalDebit',
      label: 'Total Amount',
      render: (entry) => `₵${entry.totalDebit.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (entry) => getStatusBadge(entry.status)
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (entry) => entry.createdBy
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (entry: JournalEntry) => handleEdit(entry),
      variant: 'outline' as const,
      show: (entry: JournalEntry) => entry.status === 'draft'
    },
    {
      label: 'Post',
      onClick: (entry: JournalEntry) => handlePost(entry.id),
      variant: 'default' as const,
      show: (entry: JournalEntry) => entry.status === 'draft'
    }
  ];

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalDebits = lineItems.reduce((sum, item) => sum + item.debit, 0);
  const totalCredits = lineItems.reduce((sum, item) => sum + item.credit, 0);
  const isBalanced = totalDebits === totalCredits;

  return (
    <PageTemplate
      title="Journal Entries"
      description="Create and manage journal entries for your accounting records."
      onAdd={hasPermission('ledger:write') ? handleAdd : undefined}
      onSearch={setSearchTerm}
      showAddButton={hasPermission('ledger:write')}
      showExportImport={true}
      customActions={
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <p className="text-xs text-muted-foreground">All journal entries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Entries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftEntries}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted Entries</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.postedEntries}</div>
            <p className="text-xs text-muted-foreground">Finalized</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.totalDebits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTableTemplate
        data={filteredEntries}
        columns={columns}
        loading={loading}
        emptyMessage="No journal entries found"
        showActions={false}
      />

      {/* Journal Entry Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentEntry ? 'Edit Journal Entry' : 'Create Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="entry-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(entryDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={entryDate}
                      onSelect={(date) => date && setEntryDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="JE-001"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Entry description"
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Journal Line Items</h3>
                <Button onClick={addLineItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                    </Button>
              </div>
              
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-4 border rounded-lg">
                    <div className="col-span-2">
                      <Input
                        placeholder="Account Code"
                        value={item.accountCode}
                        onChange={(e) => updateLineItem(item.id, 'accountCode', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Account Name"
                        value={item.accountName}
                        onChange={(e) => updateLineItem(item.id, 'accountName', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Debit"
                        value={item.debit || ''}
                        onChange={(e) => updateLineItem(item.id, 'debit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Credit"
                        value={item.credit || ''}
                        onChange={(e) => updateLineItem(item.id, 'credit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    {lineItems.length > 1 && (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                    </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Total Debits</div>
                    <div className="text-lg font-semibold">₵{totalDebits.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Total Credits</div>
                    <div className="text-lg font-semibold">₵{totalCredits.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Difference</div>
                    <div className={`text-lg font-semibold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      ₵{Math.abs(totalDebits - totalCredits).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!isBalanced && (
                  <div className="text-center text-red-600 text-sm mt-2">
                    Debits and credits must be equal
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isBalanced}>
              {currentEntry ? 'Update' : 'Create'} Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
    );
} 