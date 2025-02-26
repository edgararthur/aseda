import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Ledger } from '@/components/ledger/Ledger';
import { Receivables } from '@/components/receivables/Receivables';
import { Payables } from '@/components/payables/Payables';
import { Tax } from '@/components/tax/Tax';
import { Reports } from '@/components/reports/Reports';
import { Banking } from '@/components/banking/Banking';
import { Settings } from '@/components/settings/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout />
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'ledger',
        element: <Ledger />,
      },
      {
        path: 'receivables',
        element: <Receivables />,
      },
      {
        path: 'payables',
        element: <Payables />,
      },
      {
        path: 'tax',
        element: <Tax />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'banking',
        element: <Banking />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  }
]);