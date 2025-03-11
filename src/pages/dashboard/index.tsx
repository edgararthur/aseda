import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/auth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  totalReturns: number;
  netProfit: number;
  salesGrowth: number;
  expenseGrowth: number;
  returnsGrowth: number;
  profitGrowth: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  amount: number;
  created_at: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalExpenses: 0,
    totalReturns: 0,
    netProfit: 0,
    salesGrowth: 20.1,
    expenseGrowth: 4.75,
    returnsGrowth: -2.5,
    profitGrowth: 12.5,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [salesData, setSalesData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

      if (statsError) throw statsError;
      if (statsData) {
        setStats(statsData);
      }

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) throw activityError;
      if (activityData) {
        setRecentActivity(activityData);
      }

      // Fetch sales data for chart
      const { data: salesChartData, error: salesChartError } = await supabase
        .from('monthly_sales')
        .select('*')
        .order('month', { ascending: true })
        .limit(12);

      if (salesChartError) throw salesChartError;
      if (salesChartData) {
        setSalesData(salesChartData);
      }

      // Fetch expense data for chart
      const { data: expenseChartData, error: expenseChartError } = await supabase
        .from('monthly_expenses')
        .select('*')
        .order('month', { ascending: true })
        .limit(12);

      if (expenseChartError) throw expenseChartError;
      if (expenseChartData) {
        setExpenseData(expenseChartData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer
      title="Dashboard"
      description="Overview of your business performance"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Card.Header>
            <Card.Title>Total Sales</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            <div className="mt-2 flex items-center text-sm">
              {stats.salesGrowth > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span className={stats.salesGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                {stats.salesGrowth}% from last month
              </span>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Total Expenses</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
            <div className="mt-2 flex items-center text-sm">
              {stats.expenseGrowth > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-red-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-green-500" />
              )}
              <span className={stats.expenseGrowth > 0 ? 'text-red-500' : 'text-green-500'}>
                {stats.expenseGrowth}% from last month
              </span>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Total Returns</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalReturns)}</div>
            <div className="mt-2 flex items-center text-sm">
              {stats.returnsGrowth > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-red-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-green-500" />
              )}
              <span className={stats.returnsGrowth > 0 ? 'text-red-500' : 'text-green-500'}>
                {stats.returnsGrowth}% from last month
              </span>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Net Profit</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-2xl font-bold">{formatCurrency(stats.netProfit)}</div>
            <div className="mt-2 flex items-center text-sm">
              {stats.profitGrowth > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span className={stats.profitGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                {stats.profitGrowth}% from last month
              </span>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Sales Overview</Card.Title>
            <Card.Description>Monthly sales performance</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Expense Trends</Card.Title>
            <Card.Description>Monthly expense analysis</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#f43f5e" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <Card.Header>
          <Card.Title>Recent Activity</Card.Title>
          <Card.Description>Latest transactions and updates</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(activity.amount)}</p>
                  <p className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </PageContainer>
  );
} 