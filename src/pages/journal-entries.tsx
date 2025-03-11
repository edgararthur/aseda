import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  FileDown,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface JournalEntry {
  id: string;
  entry_number: string;
  date: string;
  description: string;
  status: 'draft' | 'posted' | 'voided';
  total_debit: number;
  total_credit: number;
  created_by: string;
  created_at: string;
  lines: {
    account_code: string;
    account_name: string;
    debit: number;
    credit: number;
  }[];
}

export default function JournalEntries() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<string[]>([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*, lines(*)')
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleExpand = (entryId: string) => {
    setExpandedEntries(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const getStatusColor = (status: JournalEntry['status']) => {
    switch (status) {
      case 'posted':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'voided':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.entry_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer
      title="Journal Entries"
      description="Manage your accounting transactions"
    >
      <Card>
        <Card.Header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search entries..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Entry Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <>
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleExpand(entry.id)}
                        >
                          {expandedEntries.includes(entry.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.entry_number}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                            entry.status
                          )}`}
                        >
                          {entry.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(entry.total_debit)}
                      </TableCell>
                      <TableCell>{entry.created_by}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {entry.status === 'draft' && (
                              <>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-green-600">
                                  <Check className="mr-2 h-4 w-4" />
                                  Post
                                </DropdownMenuItem>
                              </>
                            )}
                            {entry.status === 'posted' && (
                              <DropdownMenuItem className="text-red-600">
                                <X className="mr-2 h-4 w-4" />
                                Void
                              </DropdownMenuItem>
                            )}
                            {entry.status === 'draft' && (
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedEntries.includes(entry.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-gray-50 p-4">
                          <div className="rounded-md border bg-white">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Account Code</TableHead>
                                  <TableHead>Account Name</TableHead>
                                  <TableHead className="text-right">Debit</TableHead>
                                  <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {entry.lines.map((line, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{line.account_code}</TableCell>
                                    <TableCell>{line.account_name}</TableCell>
                                    <TableCell className="text-right">
                                      {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow className="border-t-2">
                                  <TableCell colSpan={2} className="font-medium">
                                    Total
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(entry.total_debit)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(entry.total_credit)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {filteredEntries.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center"
                    >
                      No entries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card.Content>
      </Card>
    </PageContainer>
  );
} 