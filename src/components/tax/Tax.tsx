import React from 'react';
import { VATHandling } from './VATHandling';
import { OtherLevies } from './OtherLevies';
import { TaxReports } from './TaxReports';

export const Tax = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Tax Management</h1>
      <VATHandling />
      <OtherLevies />
      <TaxReports />
    </div>
  );
}; 