// import React from 'react';
// import {
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   Wallet,
//   CreditCard,
//   Smartphone,
//   ArrowUpRight,
//   ArrowDownRight,
// } from 'lucide-react';
// import type { DashboardStats } from '../types';

// const StatCard = ({
//   title,
//   value,
//   trend,
//   icon: Icon,
//   percentage,
// }: {
//   title: string;
//   value: string;
//   trend: 'up' | 'down';
//   icon: React.ElementType;
//   percentage: number;
// }) => (
//   <div className="bg-white rounded-xl p-6 shadow-sm">
//     <div className="flex items-center justify-between mb-4">
//       <div className="p-2 bg-emerald-100 rounded-lg">
//         <Icon className="h-6 w-6 text-emerald-600" />
//       </div>
//       {trend === 'up' ? (
//         <div className="flex items-center text-emerald-600">
//           <ArrowUpRight className="h-4 w-4" />
//           <span className="text-sm">+{percentage}%</span>
//         </div>
//       ) : (
//         <div className="flex items-center text-red-600">
//           <ArrowDownRight className="h-4 w-4" />
//           <span className="text-sm">-{Math.abs(percentage)}%</span>
//         </div>
//       )}
//     </div>
//     <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
//     <p className="text-2xl font-semibold mt-1">₵{value}</p>
//   </div>
// );

// const DashboardStats = ({ stats }: { stats: DashboardStats }) => {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//       <StatCard
//         title="Total Revenue"
//         value={stats.totalRevenue.toLocaleString()}
//         trend="up"
//         icon={DollarSign}
//         percentage={2.5}
//       />
//       <StatCard
//         title="Total Expenses"
//         value={stats.totalExpenses.toLocaleString()}
//         trend="down"
//         icon={TrendingDown}
//         percentage={1.8}
//       />
//       <StatCard
//         title="Net Income"
//         value={stats.netIncome.toLocaleString()}
//         trend="up"
//         icon={TrendingUp}
//         percentage={3.2}
//       />
//       <StatCard
//         title="Cash on Hand"
//         value={stats.cashOnHand.toLocaleString()}
//         trend="up"
//         icon={Wallet}
//         percentage={1.5}
//       />
//       <StatCard
//         title="Bank Balance"
//         value={stats.bankBalance.toLocaleString()}
//         trend="up"
//         icon={CreditCard}
//         percentage={2.1}
//       />
//       <StatCard
//         title="Mobile Money"
//         value={stats.mobileMoney.toLocaleString()}
//         trend="up"
//         icon={Smartphone}
//         percentage={4.3}
//       />
//       <StatCard
//         title="Accounts Receivable"
//         value={stats.accountsReceivable.toLocaleString()}
//         trend="up"
//         icon={DollarSign}
//         percentage={1.2}
//       />
//       <StatCard
//         title="Accounts Payable"
//         value={stats.accountsPayable.toLocaleString()}
//         trend="down"
//         icon={DollarSign}
//         percentage={0.8}
//       />
//     </div>
//   );
// };

// export default DashboardStats;