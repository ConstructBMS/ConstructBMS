import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CalendarIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { type Milestone } from '../../services/milestoneService';
import { milestoneService } from '../../services/milestoneService';
import { demoModeService } from '../../services/demoModeService';
import MilestoneManager from './MilestoneManager';
import MilestoneModal from './MilestoneModal';

// Sample project data
const sampleProjectId = 'demo-project-1';
const sampleProjectStartDate = new Date('2024-01-01');

const MilestoneDemo: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<
    Milestone | undefined
  >();
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null
  );
  const [dayWidth, setDayWidth] = useState(20);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [milestoneCount, setMilestoneCount] = useState(0);

  // Load milestones on component mount
  useEffect(() => {
    loadMilestones();
    checkDemoMode();
  }, []);

  // Check demo mode
  const checkDemoMode = async () => {
    const isDemo = await demoModeService.getDemoMode();
    setIsDemoMode(isDemo);

    if (isDemo) {
      const count = await milestoneService.getMilestoneCount(sampleProjectId);
      setMilestoneCount(count);
    }
  };

  // Load milestones from service
  const loadMilestones = async () => {
    try {
      const projectMilestones =
        await milestoneService.getProjectMilestones(sampleProjectId);
      setMilestones(projectMilestones);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  // Toggle demo mode
  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    console.log('Demo mode:', !isDemoMode);
  };

  // Handle milestone saved
  const handleMilestoneSaved = (milestone: Milestone) => {
    setMilestones(prev => {
      const existingIndex = prev.findIndex(m => m.id === milestone.id);
      if (existingIndex >= 0) {
        // Update existing milestone
        const updated = [...prev];
        updated[existingIndex] = milestone;
        return updated;
      } else {
        // Add new milestone
        return [...prev, milestone];
      }
    });

    // Update milestone count in demo mode
    if (isDemoMode && !editingMilestone) {
      setMilestoneCount(prev => prev + 1);
    }
  };

  // Handle milestone click
  const handleMilestoneClick = (milestoneId: string) => {
    setSelectedMilestone(milestoneId);
  };

  // Handle milestone edit
  const handleMilestoneEdit = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      setEditingMilestone(milestone);
      setIsModalOpen(true);
    }
  };

  // Handle milestone delete
  const handleMilestoneDelete = async (milestoneId: string) => {
    try {
      const result = await milestoneService.deleteMilestone(milestoneId);

      if (result.success) {
        setMilestones(prev => prev.filter(m => m.id !== milestoneId));
        setSelectedMilestone(null);

        // Update milestone count in demo mode
        if (isDemoMode) {
          setMilestoneCount(prev => Math.max(0, prev - 1));
        }

        if (result.demoMode) {
          console.log('DEMO MILESTONE:', result.message);
        } else {
          console.log('Milestone deleted:', result.message);
        }
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingMilestone(undefined);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMilestone(undefined);
  };

  // Check if demo limit is reached
  const isDemoLimitReached = isDemoMode && milestoneCount >= 3;

  return (
    <div className='milestone-demo p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <div className='flex items-center space-x-2'>
            <FlagIcon className='w-6 h-6 text-blue-600' />
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Milestone Management
            </h1>
          </div>
          {isDemoMode && (
            <div className='flex items-center space-x-2 px-3 py-1 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-full'>
              <SparklesIcon className='w-4 h-4 text-pink-600 dark:text-pink-400' />
              <span className='text-sm font-medium text-pink-800 dark:text-pink-200'>
                DEMO MODE
              </span>
              <span className='text-xs text-pink-600 dark:text-pink-400'>
                {milestoneCount}/3
              </span>
            </div>
          )}
        </div>

        <div className='flex items-center space-x-3'>
          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              isDemoMode
                ? 'bg-pink-100 border border-pink-300 text-pink-700 dark:bg-pink-900/40 dark:border-pink-700 dark:text-pink-300'
                : 'bg-gray-100 border border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
            }`}
          >
            {isDemoMode ? 'Demo Mode ON' : 'Demo Mode OFF'}
          </button>

          {/* Add Milestone Button */}
          <button
            onClick={openCreateModal}
            disabled={isDemoLimitReached}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded transition-colors ${
              isDemoLimitReached
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            }`}
            title={
              isDemoLimitReached
                ? 'Demo Mode: Maximum 3 milestones reached'
                : 'Add new milestone'
            }
          >
            <PlusIcon className='w-4 h-4' />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Demo Mode Info */}
      {isDemoMode && (
        <div className='mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg'>
          <div className='flex items-start space-x-3'>
            <ExclamationTriangleIcon className='w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5' />
            <div>
              <h3 className='text-sm font-medium text-pink-800 dark:text-pink-200 mb-1'>
                Demo Mode Limitations
              </h3>
              <ul className='text-xs text-pink-700 dark:text-pink-300 space-y-1'>
                <li>• Maximum 3 milestones per project</li>
                <li>• Critical toggle disabled</li>
                <li>• Tag field disabled</li>
                <li>• Date restrictions apply</li>
                <li>• All entries tagged as demo</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Manager */}
      <div className='mb-6'>
        <MilestoneManager
          projectId={sampleProjectId}
          projectStartDate={sampleProjectStartDate}
          dayWidth={dayWidth}
          rowHeight={40}
          onMilestoneChange={setMilestones}
        />
      </div>

      {/* Timeline Preview */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
          Timeline Preview
        </h3>
        <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900'>
          <div className='relative' style={{ height: '60px' }}>
            {/* Timeline header */}
            <div className='flex items-center justify-between mb-2 text-xs text-gray-600 dark:text-gray-400'>
              <span>
                Project Start: {sampleProjectStartDate.toLocaleDateString()}
              </span>
              <span>Day Width: {dayWidth}px</span>
            </div>

            {/* Timeline grid */}
            <div
              className='relative border-t border-gray-300 dark:border-gray-600'
              style={{ top: '20px' }}
            >
              {/* Milestone displays */}
              {milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className='absolute'
                  style={{
                    left: `${((milestone.startDate.getTime() - sampleProjectStartDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth}px`,
                    top: '-8px',
                  }}
                >
                  <div
                    className='w-4 h-4 cursor-pointer transition-all duration-200'
                    style={{
                      backgroundColor:
                        milestoneService.getMilestoneColor(milestone),
                      transform: 'rotate(45deg)',
                      border: milestone.isCritical
                        ? '2px solid #dc2626'
                        : '1px solid #1e3a8a',
                    }}
                    title={`${milestone.name} - ${milestone.startDate.toLocaleDateString()}`}
                    onClick={() => handleMilestoneClick(milestone.id)}
                  >
                    <div
                      className='absolute inset-0 flex items-center justify-center'
                      style={{ transform: 'rotate(-45deg)' }}
                    >
                      <FlagIcon className='w-2 h-2 text-white' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone List */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
          Milestone List ({milestones.length})
        </h3>
        {milestones.length === 0 ? (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            <FlagIcon className='w-12 h-12 mx-auto mb-3 opacity-50' />
            <p className='text-sm'>No milestones created yet</p>
            <p className='text-xs mt-1'>
              Click "Add Milestone" to create your first milestone
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {milestones.map(milestone => (
              <div
                key={milestone.id}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedMilestone === milestone.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleMilestoneClick(milestone.id)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className='w-3 h-3'
                      style={{
                        backgroundColor:
                          milestoneService.getMilestoneColor(milestone),
                        transform: 'rotate(45deg)',
                        border: milestone.isCritical
                          ? '1px solid #dc2626'
                          : '1px solid #1e3a8a',
                      }}
                    />
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                        {milestone.name}
                        {milestone.demoMode && (
                          <span className='ml-2 text-xs text-pink-600 dark:text-pink-400 font-medium'>
                            DEMO
                          </span>
                        )}
                      </h4>
                      <div className='flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400'>
                        <span className='flex items-center'>
                          <CalendarIcon className='w-3 h-3 mr-1' />
                          {milestone.startDate.toLocaleDateString()}
                        </span>
                        <span className='capitalize'>{milestone.status}</span>
                        {milestone.isCritical && (
                          <span className='flex items-center text-red-600 dark:text-red-400'>
                            <ExclamationTriangleIcon className='w-3 h-3 mr-1' />
                            Critical
                          </span>
                        )}
                        {milestone.tag && (
                          <span className='text-blue-600 dark:text-blue-400'>
                            #{milestone.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleMilestoneEdit(milestone.id);
                      }}
                      className='p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                      title='Edit milestone'
                    >
                      ✏️
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleMilestoneDelete(milestone.id);
                      }}
                      className='p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                      title='Delete milestone'
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={isModalOpen}
        onClose={closeModal}
        projectId={sampleProjectId}
        milestone={editingMilestone}
        onMilestoneSaved={handleMilestoneSaved}
      />
    </div>
  );
};

export default MilestoneDemo;
