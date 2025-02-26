import React from 'react';
import { BankAccountManagement } from './BankAccountManagement';
import { MobileMoneyIntegration } from './MobileMoneyIntegration';
import { PaymentProcessing } from './PaymentProcessing';

export const Banking = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Bank Management</h1>
      <BankAccountManagement />
      <MobileMoneyIntegration />
      <PaymentProcessing />
    </div>
  );
}; 