import React from 'react';
import CustomerManagement from './CustomerManagement';
import SalesPipeline from './SalesPipeline';
import Contractors from './Contractors';
import CRMClientManagement from './CRMClientManagement';
import CRMConsultantManagement from './CRMConsultantManagement';
import CRMContractorManagement from './CRMContractorManagement';

interface CRMProps {
  activeModule?: string;
}

const CRM: React.FC<CRMProps> = ({ activeModule = 'crm-clients' }) => {
  // Render different components based on the active module
  switch (activeModule) {
    case 'crm-clients':
      return <CRMClientManagement />;
    case 'crm-consultants':
      return <CRMConsultantManagement />;
    case 'crm-contractors':
      return <CRMContractorManagement />;
    case 'sales':
      return <SalesPipeline />;
    default:
      return <CRMClientManagement />;
  }
};

export default CRM;
