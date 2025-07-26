import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { auditTrailService } from '../../services/auditTrailService';
import { demoModeService } from '../../services/demoModeService';
import AuditTrailModal from './AuditTrailModal';
import TaskHistoryTab from './TaskHistoryTab';

interface AuditTrailDemoProps {
  projectId?: string;
  projectName?: string;
}

const AuditTrailDemo: React.FC<AuditTrailDemoProps> = ({
  projectId = 'demo-project',
  projectName = 'Demo Project',
}) => {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoLogs, setDemoLogs] = useState<any[]>([]);
  const [isGeneratingLogs, setIsGeneratingLogs] = useState(false);

  useEffect(() => {
    checkDemoMode();
    generateDemoLogs();
  }, []);

  const checkDemoMode = async () => {
    try {
      const demoMode = await demoModeService.getDemoMode();
      setIsDemoMode(demoMode);
    } catch (error) {
      console.error('Error checking demo mode:', error);
    }
  };

  const generateDemoLogs = async () => {
    const sampleLogs = [
      {
        id: '1',
        projectId,
        taskId: 'task-1',
        userId: 'user-1',
        actionType: 'task_create',
        description: 'Created task "Foundation Excavation"',
        before: null,
        after: {
          name: 'Foundation Excavation',
          duration: 5,
          status: 'Not Started',
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        demo: true,
      },
      {
        id: '2',
        projectId,
        taskId: 'task-1',
        userId: 'user-2',
        actionType: 'task_update',
        description: 'Updated task duration from 5 to 7 days',
        before: { duration: 5 },
        after: { duration: 7 },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        demo: true,
      },
      {
        id: '3',
        projectId,
        taskId: 'task-2',
        userId: 'user-1',
        actionType: 'dependency_create',
        description: 'Created dependency: Foundation → Structure',
        before: null,
        after: { predecessorId: 'task-1', successorId: 'task-2', type: 'FS' },
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        demo: true,
      },
    ];

    setDemoLogs(sampleLogs);
  };

  const generateRandomLogs = async () => {
    setIsGeneratingLogs(true);

    const actionTypes = [
      'task_create',
      'task_update',
      'task_delete',
      'task_move',
      'task_resize',
      'dependency_create',
      'dependency_delete',
      'milestone_create',
      'milestone_update',
      'flag_create',
      'flag_update',
      'flag_delete',
      'constraint_set',
      'constraint_clear',
      'status_change',
      'progress_update',
      'resource_assign',
      'resource_unassign',
    ];

    const taskNames = [
      'Foundation Work',
      'Structural Steel',
      'Roofing Installation',
      'Electrical Rough-in',
      'Plumbing Installation',
      'HVAC Ductwork',
      'Interior Finishing',
      'Landscaping',
    ];

    const descriptions = [
      'Updated task duration based on site conditions',
      'Added dependency due to material delivery delay',
      'Set constraint for weather-dependent activities',
      'Assigned additional resources to meet deadline',
      'Updated progress based on site inspection',
      'Created milestone for phase completion',
      'Added flag for quality control review',
      'Modified task sequence for efficiency',
    ];

    // Generate 5-10 random logs
    const numLogs = Math.floor(Math.random() * 6) + 5;
    const newLogs = [];

    for (let i = 0; i < numLogs; i++) {
      const actionType =
        actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const taskName = taskNames[Math.floor(Math.random() * taskNames.length)];
      const description =
        descriptions[Math.floor(Math.random() * descriptions.length)];

      const log = {
        id: `demo-${Date.now()}-${i}`,
        projectId,
        taskId: `task-${Math.floor(Math.random() * 10) + 1}`,
        userId: `user-${Math.floor(Math.random() * 3) + 1}`,
        actionType,
        description: `${auditTrailService.getActionTypeDisplayName(actionType)}: ${description}`,
        before: Math.random() > 0.5 ? { someField: 'old value' } : null,
        after: Math.random() > 0.5 ? { someField: 'new value' } : null,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24 hours
        demo: true,
      };

      newLogs.push(log);
    }

    // Add new logs to existing ones
    setDemoLogs(prev => [...newLogs, ...prev].slice(0, 20)); // Keep max 20 logs

    setIsGeneratingLogs(false);
  };

  const clearDemoLogs = () => {
    setDemoLogs([]);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Audit Trail Demo
            </h2>
            <p className='text-gray-600 mt-1'>
              Explore the comprehensive audit trail functionality with demo data
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {isDemoMode && (
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800'>
                Demo Mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Demo Controls
        </h3>
        <div className='flex items-center gap-4'>
          <button
            onClick={generateRandomLogs}
            disabled={isGeneratingLogs}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
          >
            {isGeneratingLogs ? (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            ) : (
              <PlayIcon className='w-4 h-4' />
            )}
            Generate Random Logs
          </button>

          <button
            onClick={clearDemoLogs}
            className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
          >
            <StopIcon className='w-4 h-4' />
            Clear Logs
          </button>

          <button
            onClick={() => setIsAuditModalOpen(true)}
            className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
          >
            <DocumentTextIcon className='w-4 h-4' />
            Open Full Audit Trail
          </button>
        </div>
      </div>

      {/* Demo Mode Info */}
      {isDemoMode && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <div className='flex items-start space-x-2'>
            <ExclamationTriangleIcon className='w-5 h-5 text-yellow-600 mt-0.5' />
            <div className='text-sm text-yellow-800'>
              <p className='font-medium'>Demo Mode Restrictions:</p>
              <ul className='mt-1 space-y-1'>
                {auditTrailService
                  .getDemoModeRestrictions()
                  .map((restriction, index) => (
                    <li key={index} className='flex items-start space-x-2'>
                      <span className='text-yellow-600 mt-1'>•</span>
                      <span>{restriction}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sample Task History */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Sample Task History
        </h3>
        <div className='border border-gray-200 rounded-lg'>
          <TaskHistoryTab
            taskId='task-1'
            projectId={projectId}
            taskName='Foundation Excavation'
          />
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Recent Audit Logs
        </h3>
        <div className='space-y-3'>
          {demoLogs.length === 0 ? (
            <p className='text-gray-500 text-center py-8'>
              No audit logs yet. Generate some logs to see them here.
            </p>
          ) : (
            demoLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'
              >
                <span className='text-2xl'>
                  {auditTrailService.getActionTypeIcon(log.actionType)}
                </span>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h4 className='text-sm font-medium text-gray-900'>
                      {auditTrailService.getActionTypeDisplayName(
                        log.actionType
                      )}
                    </h4>
                    {log.demo && (
                      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800'>
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-600 mt-1'>
                    {log.description}
                  </p>
                  <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
                    <span>By Demo User</span>
                    <span>•</span>
                    <span>{log.createdAt.toLocaleString()}</span>
                    {log.taskId && (
                      <>
                        <span>•</span>
                        <span className='text-blue-600'>Task {log.taskId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {demoLogs.length > 5 && (
          <div className='text-center mt-4'>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className='text-blue-600 hover:text-blue-800 text-sm font-medium'
            >
              View all {demoLogs.length} logs
            </button>
          </div>
        )}
      </div>

      {/* Features Overview */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Audit Trail Features
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <DocumentTextIcon className='w-8 h-8 text-blue-600 mb-2' />
            <h4 className='font-medium text-gray-900'>Comprehensive Logging</h4>
            <p className='text-sm text-gray-600 mt-1'>
              All timeline changes are automatically logged with before/after
              states
            </p>
          </div>

          <div className='p-4 bg-green-50 rounded-lg'>
            <ClockIcon className='w-8 h-8 text-green-600 mb-2' />
            <h4 className='font-medium text-gray-900'>Task History</h4>
            <p className='text-sm text-gray-600 mt-1'>
              View complete history for individual tasks with detailed change
              tracking
            </p>
          </div>

          <div className='p-4 bg-purple-50 rounded-lg'>
            <ChartBarIcon className='w-8 h-8 text-purple-600 mb-2' />
            <h4 className='font-medium text-gray-900'>Advanced Filtering</h4>
            <p className='text-sm text-gray-600 mt-1'>
              Filter by user, action type, date range, and search keywords
            </p>
          </div>

          <div className='p-4 bg-yellow-50 rounded-lg'>
            <ExclamationTriangleIcon className='w-8 h-8 text-yellow-600 mb-2' />
            <h4 className='font-medium text-gray-900'>Demo Mode Support</h4>
            <p className='text-sm text-gray-600 mt-1'>
              Limited functionality in demo mode with clear upgrade prompts
            </p>
          </div>

          <div className='p-4 bg-red-50 rounded-lg'>
            <DocumentTextIcon className='w-8 h-8 text-red-600 mb-2' />
            <h4 className='font-medium text-gray-900'>
              Permission-Based Access
            </h4>
            <p className='text-sm text-gray-600 mt-1'>
              Role-based permissions control access to audit trail features
            </p>
          </div>

          <div className='p-4 bg-indigo-50 rounded-lg'>
            <ChartBarIcon className='w-8 h-8 text-indigo-600 mb-2' />
            <h4 className='font-medium text-gray-900'>
              Statistics & Analytics
            </h4>
            <p className='text-sm text-gray-600 mt-1'>
              View audit statistics and activity summaries for projects
            </p>
          </div>
        </div>
      </div>

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        projectId={projectId}
        projectName={projectName}
      />
    </div>
  );
};

export default AuditTrailDemo;
