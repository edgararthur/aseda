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
const Invoices = lazy(() => import('./pages/invoices/index'));
const SalesReturns = lazy(() => import('./pages/sales-returns/index'));
const OrdersQuotations = lazy(() => import('./pages/orders-quotations/index'));
const PurchaseReturns = lazy(() => import('./pages/purchase-returns/index'));
const JournalEntries = lazy(() => import('./pages/journal-entries/index'));
const BankReconciliation = lazy(() => import('./pages/bank-reconciliation/index'));
const Products = lazy(() => import('./pages/products/index'));
const StockManagement = lazy(() => import('./pages/stock-management/index'));
const ProductCategories = lazy(() => import('./pages/product-categories/index'));
const Employees = lazy(() => import('./pages/employees/index'));
const Payroll = lazy(() => import('./pages/payroll/index'));
const Departments = lazy(() => import('./pages/departments/index'));
const FixedAssets = lazy(() => import('./pages/fixed-assets/index'));
const Expenses = lazy(() => import('./pages/expenses/index'));
const AssetCategories = lazy(() => import('./pages/asset-categories/index'));
const VatReturns = lazy(() => import('./pages/vat-returns/index'));
const WithholdingTax = lazy(() => import('./pages/withholding-tax/index'));
const TaxSettings = lazy(() => import('./pages/tax-settings/index'));
const GeneralLedger = lazy(() => import('./pages/general-ledger/index'));
const TrialBalance = lazy(() => import('./pages/trial-balance/index'));
const BalanceSheet = lazy(() => import('./pages/balance-sheet/index'));
const IncomeStatement = lazy(() => import('./pages/income-statement/index'));
const CashFlow = lazy(() => import('./pages/cash-flow/index'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  // Add a timeout fallback to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout reached, forcing app to continue');
        setTimeoutReached(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timeoutReached) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your content.</p>
          {error && (
            <p className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // If timeout reached or error, try to continue
  if (timeoutReached || error) {
    console.log('Continuing with timeout/error state:', { timeoutReached, error, user });
  }

  if (!user && !timeoutReached) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  // Add a timeout fallback to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout reached for public route');
        setTimeoutReached(true);
      }
    }, 10000); // 10 second timeout for public routes

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timeoutReached) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your content.</p>
          {error && (
            <p className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (user && !timeoutReached) {
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
              
              {/* Auth Routes */}
              <Route
                path="/auth/login"
                element={
                  <PublicRoute>
                    <LoginForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/auth/signup"
                element={
                  <PublicRoute>
                    <SignupForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/auth/forgot-password"
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