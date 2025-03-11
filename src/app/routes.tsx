import { createBrowserRouter } from 'react-router-dom';
import GeneralLedger from '@/pages/general-ledger';
import TaxFilings from '@/pages/tax-filings';
import Products from '@/pages/products';
import InventoryManagement from '@/pages/inventory-management';
import Employees from '@/pages/employees';
import Payroll from '@/pages/payroll';
import FixedAssets from '@/pages/fixed-assets';
import Settings from '@/pages/settings';
import UserManagement from '@/pages/user-management';
import MasterData from '@/pages/master-data';
import Layout from '@/components/layout/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <GeneralLedger />,
      },
      {
        path: '/general-ledger',
        element: <GeneralLedger />,
      },
      {
        path: '/tax-filings',
        element: <TaxFilings />,
      },
      {
        path: '/products',
        element: <Products />,
      },
      {
        path: '/inventory-management',
        element: <InventoryManagement />,
      },
      {
        path: '/employees',
        element: <Employees />,
      },
      {
        path: '/payroll',
        element: <Payroll />,
      },
      {
        path: '/fixed-assets',
        element: <FixedAssets />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/user-management',
        element: <UserManagement />,
      },
      {
        path: '/master-data',
        element: <MasterData />,
      },
    ],
  },
]); 