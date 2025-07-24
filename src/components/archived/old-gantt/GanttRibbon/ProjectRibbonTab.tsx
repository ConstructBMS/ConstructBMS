import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CalendarIcon, 
  ClipboardDocumentCheckIcon,
  FlagIcon,
  DocumentIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export const ProjectRibbonTab: React.FC = () => {
  const { canAccess } = usePermissions();
  
  // Modal state management
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  const can = (key: string) => canAccess(`gantt.project.${key}`);

  // Sample project data (would come from context/service in real implementation)
  const projectData = {
    name: 'Sample Construction Project',
    client: 'ABC Construction Ltd',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    budget: 2500000,
    actualCost: 1800000,
    progress: 65,
    manager: 'John Smith',
    status: 'Active'
  };

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Project Info Group */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {can('info') && (
              <button
                onClick={() => setShowProjectInfo(true)}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Project Information"
              >
                <InformationCircleIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Info</span>
              </button>
            )}
            {can('properties') && (
              <button
                onClick={() => alert('Open Project Properties modal')}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Project Properties"
              >
                <DocumentTextIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Properties</span>
              </button>
            )}
            {can('start-end') && (
              <button
                onClick={() => alert('Set Project Start / End Dates')}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Project Start/End Dates"
              >
                <ClockIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Start/End</span>
              </button>
            )}
          </div>
          <div className="text-xs text-gray-600 font-medium">Project</div>
        </div>

        {/* Calendar & Planning Group */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {can('calendar') && (
              <button
                onClick={() => setShowCalendar(true)}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Project Calendars"
              >
                <CalendarIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Calendars</span>
              </button>
            )}
            {can('notes') && (
              <button
                onClick={() => setShowNotes(true)}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Project Notes"
              >
                <DocumentIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Notes</span>
              </button>
            )}
            {can('milestones') && (
              <button
                onClick={() => alert('Milestone configuration (planned)')}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Project Milestones"
              >
                <FlagIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Milestones</span>
              </button>
            )}
          </div>
          <div className="text-xs text-gray-600 font-medium">Planning</div>
        </div>

        {/* Baselines & Revisions Group */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {can('baselines') && (
              <button
                onClick={() => setShowRevisions(true)}
                className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
                title="Project Baselines & Revisions"
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5 mb-1 text-gray-700" />
                <span className="text-xs text-gray-700">Revisions</span>
              </button>
            )}
          </div>
          <div className="text-xs text-gray-600 font-medium">Baselines</div>
        </div>

        {/* Project Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Project: {projectData.name}
          </div>
          <div className="text-xs text-gray-500">
            Status: {projectData.status}
          </div>
          <div className="text-xs text-gray-500">
            Progress: {projectData.progress}%
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Project Calendars</h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Working Calendar</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">Working Days</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option>Monday - Friday</option>
                      <option>Monday - Saturday</option>
                      <option>Sunday - Saturday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Working Hours</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option>8:00 AM - 5:00 PM</option>
                      <option>7:00 AM - 6:00 PM</option>
                      <option>9:00 AM - 4:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Holidays & Exceptions</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">New Year's Day</span>
                    <span className="text-sm text-gray-500">January 1, 2024</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Christmas Day</span>
                    <span className="text-sm text-gray-500">December 25, 2024</span>
                  </div>
                </div>
                <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                  + Add Holiday
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Project Notes</h2>
              <button
                onClick={() => setShowNotes(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Notes
                </label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 h-48 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write project notes, observations, or important information here..."
                  defaultValue="This is a sample construction project for demonstration purposes. The project involves building a commercial office complex with multiple phases.

Key milestones:
- Foundation work: Q1 2024
- Structural framework: Q2 2024
- Interior finishing: Q3 2024
- Final inspection: Q4 2024

Notes: All materials must meet local building codes and environmental standards."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Internal team notes and comments..."
                  defaultValue="Team meeting scheduled for weekly updates. Budget tracking required monthly."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowNotes(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revisions Modal */}
      {showRevisions && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[700px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Revisions & Baselines</h2>
              <button
                onClick={() => setShowRevisions(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Saved Baselines</h3>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Create Baseline
                </button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Baseline Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tasks</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">Initial Baseline</td>
                      <td className="px-4 py-3 text-sm text-gray-500">Jan 1, 2024</td>
                      <td className="px-4 py-3 text-sm">24 tasks</td>
                      <td className="px-4 py-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                        <button className="text-green-600 hover:text-green-800 mr-2">Restore</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">Q1 Review</td>
                      <td className="px-4 py-3 text-sm text-gray-500">Mar 31, 2024</td>
                      <td className="px-4 py-3 text-sm">26 tasks</td>
                      <td className="px-4 py-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                        <button className="text-green-600 hover:text-green-800 mr-2">Restore</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-2">Baseline Information</h4>
                <p className="text-sm text-blue-700">
                  Baselines capture a snapshot of your project at a specific point in time. 
                  You can compare current progress against baselines and restore to previous versions if needed.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowRevisions(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Info Modal */}
      {showProjectInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Project Information</h2>
              <button
                onClick={() => setShowProjectInfo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    defaultValue={projectData.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    defaultValue={projectData.client}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    defaultValue={projectData.startDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    defaultValue={projectData.endDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    defaultValue={projectData.budget}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    defaultValue={projectData.manager}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-2">Project Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Progress:</span>
                    <div className="font-medium">{projectData.progress}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Actual Cost:</span>
                    <div className="font-medium">${projectData.actualCost.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="font-medium text-green-600">{projectData.status}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowProjectInfo(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 