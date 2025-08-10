import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthCallback } from '@/components/auth/AuthCallback';
import { Layout } from './components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load components
const Dashboard = lazy(() => import('./pages/dashboard/index'));
const Invoices = lazy(() => import('./pages/invoices'));
const SalesReturns = lazy(() => import('./pages/sales-returns'));
const OrdersQuotations = lazy(() => import('./pages/orders-quotations'));
const PurchaseReturns = lazy(() => import('./pages/purchase-returns'));
const JournalEntries = lazy(() => import('./pages/journal-entries'));
const BankReconciliation = lazy(() => import('./pages/bank-reconciliation'));
const Products = lazy(() => import('./pages/products'));
const StockManagement = lazy(() => import('./pages/stock-management'));
const ProductCategories = lazy(() => import('./pages/product-categories'));
const Employees = lazy(() => import('./pages/employees'));
const Payroll = lazy(() => import('./pages/payroll'));
const Departments = lazy(() => import('./pages/departments'));
const FixedAssets = lazy(() => import('./pages/fixed-assets'));
const Expenses = lazy(() => import('./pages/expenses'));
const AssetCategories = lazy(() => import('./pages/asset-categories'));
const VatReturns = lazy(() => import('./pages/vat-returns'));
const WithholdingTax = lazy(() => import('./pages/withholding-tax'));
const TaxSettings = lazy(() => import('./pages/tax-settings'));
const GeneralLedger = lazy(() => import('./pages/general-ledger'));
const TrialBalance = lazy(() => import('./pages/trial-balance'));
const BalanceSheet = lazy(() => import('./pages/balance-sheet'));
const IncomeStatement = lazy(() => import('./pages/income-statement'));
const CashFlow = lazy(() => import('./pages/cash-flow'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your content.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your content.</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className='bg-blue-50 min-h-screen'>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignupForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordForm />
                  </PublicRoute>
                }
              />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Private Routes */}
              <Route
                path="/dashboard/*"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                
                {/* Transactions */}
                <Route path="invoices" element={<Invoices />} />
                <Route path="sales-returns" element={<SalesReturns />} />
                <Route path="orders-quotations" element={<OrdersQuotations />} />
                <Route path="purchase-returns" element={<PurchaseReturns />} />
                <Route path="journal-entries" element={<JournalEntries />} />
                <Route path="bank-reconciliation" element={<BankReconciliation />} />

                {/* Inventory & Products */}
                <Route path="products" element={<Products />} />
                <Route path="stock-management" element={<StockManagement />} />
                <Route path="product-categories" element={<ProductCategories />} />

                {/* Payroll & HR */}
                <Route path="employees" element={<Employees />} />
                <Route path="payroll" element={<Payroll />} />
                <Route path="departments" element={<Departments />} />

                {/* Fixed Assets & Expenses */}
                <Route path="fixed-assets" element={<FixedAssets />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="asset-categories" element={<AssetCategories />} />

                {/* Tax Management */}
                <Route path="vat-returns" element={<VatReturns />} />
                <Route path="withholding-tax" element={<WithholdingTax />} />
                <Route path="tax-settings" element={<TaxSettings />} />

                {/* Reports & Financials */}
                <Route path="general-ledger" element={<GeneralLedger />} />
                <Route path="trial-balance" element={<TrialBalance />} />
                <Route path="balance-sheet" element={<BalanceSheet />} />
                <Route path="income-statement" element={<IncomeStatement />} />
                <Route path="cash-flow" element={<CashFlow />} />
              </Route>

              {/* Redirect root to dashboard */}
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}