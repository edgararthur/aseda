import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load components
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const FinancialOverview = lazy(() => import('./components/dashboard/FinancialOverview'));
const Sales = lazy(() => import('./components/sales/Sales'));
const SalesOrderQuotations = lazy(() => import('./components/sales/SalesOrderQuotations'));
const Invoice = lazy(() => import('./components/invoice/Invoice'));
const Ledger = lazy(() => import('./components/ledger/Ledger'));
const Payables = lazy(() => import('./components/payables/Payables'));
// const TaxManagement = lazy(() => import('./components/tax/TaxManagement'));
// const ReceiptsReport = lazy(() => import('./components/reports/ReceiptsReport'));
// const Product = lazy(() => import('./components/products/Product'));
// const BankReconciliation = lazy(() => import('./components/transactions/BankReconciliation'));
const InvoiceTaxDetails = lazy(() => import('./components/tax/InvoiceTaxDetails'));
const SalesReturns = lazy(() => import('./components/sales/SalesReturns'));
const PurchaseReturns = lazy(() => import('./components/products/PurchaseReturns'));
const EmployeeSalary = lazy(() => import('./components/payroll/EmployeeSalary'));
// const Expenses = lazy(() => import('./components/transactions/Expenses'));
// const Payslip = lazy(() => import('./components/payroll/PaySlip'));
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className='bg-blue-50 min-h-screen'>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path='/transactions' element={<ProtectedRoute><FinancialOverview /></ProtectedRoute>} />
              <Route path='/sales' element={<ProtectedRoute><Sales /></ProtectedRoute>} />
              <Route path='/sales-returns' element={<ProtectedRoute><SalesReturns /></ProtectedRoute>} />
              <Route path='/sales-order-quotations' element={<ProtectedRoute><SalesOrderQuotations /></ProtectedRoute>} />
              {/* <Route path='/products' element={<ProtectedRoute><Product /></ProtectedRoute>} /> */}
              <Route path='/purchase-returns' element={<ProtectedRoute><PurchaseReturns /></ProtectedRoute>} />
              <Route path='/invoice' element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
              <Route path='/purchase-orders' element={<ProtectedRoute><SalesOrderQuotations /></ProtectedRoute>} />
              {/* <Route path='/bank-reconciliation' element={<ProtectedRoute><BankReconciliation /></ProtectedRoute>} /> */}
              <Route path='/accounts-payable' element={<ProtectedRoute><Payables /></ProtectedRoute>} />
              <Route path="/invoice-tax-details" element={<ProtectedRoute><InvoiceTaxDetails /></ProtectedRoute>} />
              <Route path="/payroll" element={<ProtectedRoute><EmployeeSalary /></ProtectedRoute>} />
              {/* <Route path="/tax-management" element={<ProtectedRoute><TaxManagement /></ProtectedRoute>} /> */}
              <Route path="/general-ledger" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
              {/* <Route path="/receipt-reports" element={<ProtectedRoute><ReceiptsReport /></ProtectedRoute>} /> */}
              {/* <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} /> */}
              <Route path="/auth/login" element={<LoginForm />} />
              <Route path="/auth/signup" element={<SignUpForm />} />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}