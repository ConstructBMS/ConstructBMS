import React, { useState } from 'react';
import TimelinePrintView from './TimelinePrintView';

const TimelinePrintViewDemo: React.FC = () => {
  const [printComplete, setPrintComplete] = useState<any>(null);

  // Sample project data
  const projectData = {
    projectId: 'demo-project-001',
    projectName: 'Office Building Construction',
    projectIdDisplay: 'OB-2024-001',
    tasks: [
      {
        id: '1',
        name: 'Site Preparation',
        type: 'summary',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15'),
        progress: 100,
        critical: false
      },
      {
        id: '2',
        name: 'Foundation Work',
        type: 'task',
        start: new Date('2024-01-16'),
        end: new Date('2024-02-15'),
        progress: 75,
        critical: true
      },
      {
        id: '3',
        name: 'Structural Framework',
        type: 'task',
        start: new Date('2024-02-16'),
        end: new Date('2024-04-15'),
        progress: 50,
        critical: true
      },
      {
        id: '4',
        name: 'Electrical Installation',
        type: 'task',
        start: new Date('2024-03-01'),
        end: new Date('2024-05-15'),
        progress: 25,
        critical: false
      },
      {
        id: '5',
        name: 'Plumbing Installation',
        type: 'task',
        start: new Date('2024-03-15'),
        end: new Date('2024-05-30'),
        progress: 30,
        critical: false
      },
      {
        id: '6',
        name: 'Interior Finishing',
        type: 'summary',
        start: new Date('2024-05-01'),
        end: new Date('2024-07-15'),
        progress: 10,
        critical: false
      },
      {
        id: '7',
        name: 'Exterior Finishing',
        type: 'task',
        start: new Date('2024-04-15'),
        end: new Date('2024-06-30'),
        progress: 40,
        critical: false
      },
      {
        id: '8',
        name: 'Landscaping',
        type: 'task',
        start: new Date('2024-06-01'),
        end: new Date('2024-07-15'),
        progress: 0,
        critical: false
      },
      {
        id: '9',
        name: 'Final Inspection',
        type: 'task',
        start: new Date('2024-07-01'),
        end: new Date('2024-07-31'),
        progress: 0,
        critical: true
      },
      {
        id: '10',
        name: 'Project Handover',
        type: 'task',
        start: new Date('2024-08-01'),
        end: new Date('2024-08-15'),
        progress: 0,
        critical: false
      }
    ],
    filters: {
      status: 'in_progress',
      priority: 'high',
      assignee: 'John Smith'
    },
    currentView: {
      zoomLevel: 'weeks',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-08-31'),
      showCriticalPath: true,
      showDependencies: true
    }
  };

  const handlePrintComplete = (metadata: any) => {
    setPrintComplete(metadata);
    console.log('Print completed:', metadata);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Timeline Print View Demo
        </h1>
        <p className="text-gray-600 mb-6">
          This demo showcases the Timeline Print View functionality for ConstructBMS.
          Click the print buttons below to test different print variants.
        </p>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Project Name:</span>
            <span className="ml-2 text-gray-900">{projectData.projectName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Project ID:</span>
            <span className="ml-2 text-gray-900">{projectData.projectIdDisplay}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Tasks:</span>
            <span className="ml-2 text-gray-900">{projectData.tasks.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Date Range:</span>
            <span className="ml-2 text-gray-900">
              {projectData.currentView.startDate.toLocaleDateString()} - {projectData.currentView.endDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Print Variants */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Print Variants</h2>
        
        <div className="space-y-4">
          {/* Button Variant */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Primary Button</h3>
            <TimelinePrintView
              {...projectData}
              variant="button"
              onPrintComplete={handlePrintComplete}
            />
          </div>

          {/* Dropdown Variant */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Dropdown Style</h3>
            <TimelinePrintView
              {...projectData}
              variant="dropdown"
              onPrintComplete={handlePrintComplete}
            />
          </div>

          {/* Inline Variant */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Inline Style</h3>
            <TimelinePrintView
              {...projectData}
              variant="inline"
              onPrintComplete={handlePrintComplete}
            />
          </div>
        </div>
      </div>

      {/* Sample Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Tasks</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Critical
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectData.tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.start.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.end.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span>{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.critical ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Critical
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Complete Status */}
      {printComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800 mb-2">Print Completed Successfully!</h3>
          <div className="text-sm text-green-700 space-y-1">
            <div>Total Tasks: {printComplete.totalTasks}</div>
            <div>Date Range: {printComplete.dateRange}</div>
            <div>Demo Mode: {printComplete.demo ? 'Yes' : 'No'}</div>
            <div>Total Pages: {printComplete.totalPages}</div>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Print Options</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Page orientation (Portrait/Landscape)</li>
              <li>• Page size (A3/A4/Fit to Width)</li>
              <li>• Include project header</li>
              <li>• Include branding</li>
              <li>• Include active filters</li>
              <li>• Include footer and page numbers</li>
              <li>• Custom date range selection</li>
              <li>• Page break control</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Demo Mode Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Limited to 10 tasks</li>
              <li>• Fixed A4 page size</li>
              <li>• Required branding</li>
              <li>• Watermarked output</li>
              <li>• Demo restrictions enforced</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePrintViewDemo; 