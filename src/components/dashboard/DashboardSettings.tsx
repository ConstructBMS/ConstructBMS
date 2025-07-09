import React from 'react';
import {
  Cog6ToothIcon,
  ViewColumnsIcon,
  ArrowPathIcon,
  LockClosedIcon,
  LockOpenIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface DashboardSettingsProps {
  showGrid: boolean;
  onToggleGrid: () => void;
  onAutoOrganize: () => void;
  onResetLayout: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
  onClose: () => void;
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  showGrid,
  onToggleGrid,
  onAutoOrganize,
  onResetLayout,
  isLocked,
  onToggleLock,
  onClose,
}) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full mx-4'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-archer-grey rounded-lg flex items-center justify-center'>
              <Cog6ToothIcon className='h-6 w-6 text-archer-neon' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Dashboard Settings
              </h2>
              <p className='text-sm text-gray-500'>
                Configure your dashboard layout
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Settings Options */}
        <div className='p-6 space-y-4'>
          {/* Lock/Unlock Widgets */}
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center space-x-3'>
              {isLocked ? (
                <LockClosedIcon className='h-5 w-5 text-red-500' />
              ) : (
                <LockOpenIcon className='h-5 w-5 text-green-500' />
              )}
              <div>
                <h3 className='font-medium text-gray-900'>Widget Lock</h3>
                <p className='text-sm text-gray-500'>
                  {isLocked
                    ? 'Widgets are locked in position'
                    : 'Widgets can be moved and resized'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleLock}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLocked
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isLocked ? 'Unlock' : 'Lock'}
            </button>
          </div>

          {/* Show/Hide Grid */}
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center space-x-3'>
              <ViewColumnsIcon className='h-5 w-5 text-blue-500' />
              <div>
                <h3 className='font-medium text-gray-900'>Grid Overlay</h3>
                <p className='text-sm text-gray-500'>
                  {showGrid ? 'Grid is visible' : 'Grid is hidden'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleGrid}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showGrid
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showGrid ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Auto-Organize Widgets */}
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center space-x-3'>
              <Squares2X2Icon className='h-5 w-5 text-purple-500' />
              <div>
                <h3 className='font-medium text-gray-900'>Auto-Organize</h3>
                <p className='text-sm text-gray-500'>
                  Automatically arrange widgets based on content
                </p>
              </div>
            </div>
            <button
              onClick={onAutoOrganize}
              className='px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors'
            >
              Organize
            </button>
          </div>

          {/* Reset Layout */}
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center space-x-3'>
              <ArrowPathIcon className='h-5 w-5 text-orange-500' />
              <div>
                <h3 className='font-medium text-gray-900'>Reset Layout</h3>
                <p className='text-sm text-gray-500'>
                  Restore default dashboard layout
                </p>
              </div>
            </div>
            <button
              onClick={onResetLayout}
              className='px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors'
            >
              Reset
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='w-full px-4 py-2 bg-archer-neon text-black rounded-lg font-medium hover:bg-archer-green transition-colors'
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;
