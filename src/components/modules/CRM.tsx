import React from 'react';
import CustomerManagement from './CustomerManagement';
import SalesPipeline from './SalesPipeline';
import Contractors from './Contractors';

interface CRMProps {
  activeModule?: string;
}

const CRM: React.FC<CRMProps> = ({ activeModule = 'customers' }) => {
  // Render different components based on the active module
  switch (activeModule) {
    case 'customers':
      return <CustomerManagement />;
    case 'contractors':
      return <Contractors />;
    case 'sales':
      return <SalesPipeline />;
    default:
      return <CustomerManagement />;
  }
};

export default CRM;
