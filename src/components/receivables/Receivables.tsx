import React from 'react';
import { Customers } from './Customers';
import { Invoices } from './Invoices';
import { Collections } from './Collections';

export const Receivables = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Accounts Receivable</h1>
      <Customers />
      <Invoices />
      <Collections />
    </div>
  );
}; 