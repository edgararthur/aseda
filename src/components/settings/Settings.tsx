import React from 'react';
import { OrganizationSettings } from './OrganizationSettings';
import { UserManagement } from './UserManagement';
import { SystemSettings } from './SystemSettings';

export const Settings = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <OrganizationSettings />
      <UserManagement />
      <SystemSettings />
    </div>
  );
}; 