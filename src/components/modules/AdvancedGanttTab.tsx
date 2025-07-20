import React from 'react';

interface AdvancedGanttTabProps {
  project?: any;
}

const AdvancedGanttTab: React.FC<AdvancedGanttTabProps> = ({ project }) => {
  return (
    <div className="gantt-tab-container p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Gantt Chart Module
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          A new Gantt chart module is being built. This will provide comprehensive project planning and scheduling capabilities.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Coming Soon
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            The new Gantt module will include advanced project planning features, resource management, and scheduling capabilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedGanttTab; 
