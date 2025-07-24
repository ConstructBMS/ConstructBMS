import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { demoModeService } from '../../../services/demoModeService';
import { auditTrailService } from '../../../services/auditTrailService';
import AuditTrailModal from '../AuditTrailModal';

interface AuditSectionProps {
  disabled?: boolean;
  projectId: string;
  projectName?: string;
}

const AuditSection: React.FC<AuditSectionProps> = ({ 
  projectId, 
  projectName, 
  disabled = false 
}) => {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { canAccess } = usePermissions();

  const handleViewAuditTrail = async () => {
    try {
      // Check demo mode
      const demoMode = await demoModeService.isDemoMode();
      setIsDemoMode(demoMode);
      
      // Open audit modal
      setIsAuditModalOpen(true);
    } catch (error) {
      console.error('Error opening audit trail:', error);
    }
  };

  const canViewTaskHistory = canAccess('programme.audit.view-task');
  const canViewFullAudit = canAccess('programme.audit.view-all');

  if (!canViewTaskHistory && !canViewFullAudit) {
    return null; // Don't render if user has no audit permissions
  }

  return (
    <>
      <div className="ribbon-group">
        <div className="ribbon-group-title text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Audit Trail
        </div>
        <div className="flex space-x-1">
          {/* View Audit Trail Button */}
          <button
            onClick={handleViewAuditTrail}
            disabled={disabled || !canViewFullAudit}
            className={`ribbon-button ${!canViewFullAudit ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              !canViewFullAudit 
                ? 'Requires programme.audit.view-all permission'
                : 'View full project audit trail with filters and statistics'
            }
          >
            <DocumentTextIcon className="w-5 h-5" />
            <span className="text-xs">View Audit Trail</span>
          </button>

          {/* Quick History Button */}
          <button
            onClick={() => {
              // TODO: Open quick history view (last 10 actions)
              console.log('Quick history');
            }}
            disabled={disabled || !canViewTaskHistory}
            className={`ribbon-button ${!canViewTaskHistory ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              !canViewTaskHistory 
                ? 'Requires programme.audit.view-task permission'
                : 'Quick view of recent project changes'
            }
          >
            <ClockIcon className="w-5 h-5" />
            <span className="text-xs">Quick History</span>
          </button>

          {/* Audit Statistics Button */}
          <button
            onClick={() => {
              // TODO: Open audit statistics view
              console.log('Audit statistics');
            }}
            disabled={disabled || !canViewFullAudit}
            className={`ribbon-button ${!canViewFullAudit ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              !canViewFullAudit 
                ? 'Requires programme.audit.view-all permission'
                : 'View audit statistics and analytics'
            }
          >
            <ChartBarIcon className="w-5 h-5" />
            <span className="text-xs">Statistics</span>
          </button>
        </div>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="flex items-center gap-1 text-yellow-800">
              <ExclamationTriangleIcon className="w-3 h-3" />
              <span>Demo Mode: Limited audit history</span>
            </div>
            <div className="mt-1 text-yellow-700">
              {auditTrailService.getDemoModeRestrictions().slice(0, 2).map((restriction, index) => (
                <div key={index} className="text-xs">• {restriction}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        projectId={projectId}
        projectName={projectName}
      />
    </>
  );
};

export default AuditSection; 