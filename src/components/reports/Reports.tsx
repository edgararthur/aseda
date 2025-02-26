import React from 'react';
import { StandardReports } from './StandardReports';
import { CustomReports } from './CustomReports';

export const Reports = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Financial Reports</h1>
      <StandardReports />
      <CustomReports />
    </div>
  );
}; 