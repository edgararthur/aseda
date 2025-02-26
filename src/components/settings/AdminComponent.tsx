import React from 'react';
import { UserManagement } from './UserManagement';
import { SystemSettings } from './SystemSettings';

const AdminComponent = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <UserManagement />
      <SystemSettings />
      {/* Add more admin functionalities as needed */}
    </div>
  );
};

export default AdminComponent; 