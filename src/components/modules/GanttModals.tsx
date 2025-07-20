// Gantt Chart Modal Components
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-100 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Import Modal
export const ImportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Gantt Data">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Drag and drop files here, or click to browse</p>
          <p className="text-xs text-gray-500 mt-2">Supports: .xml, .mpp, .csv, .json</p>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-blue/90 transition-colors">
            Browse Files
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Export Modal
export const ExportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Gantt Data">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium">XML Format</div>
            <div className="text-sm text-gray-600">Asta Powerproject compatible</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium">CSV Format</div>
            <div className="text-sm text-gray-600">Spreadsheet compatible</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium">JSON Format</div>
            <div className="text-sm text-gray-600">API integration</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium">PDF Report</div>
            <div className="text-sm text-gray-600">Printable format</div>
          </button>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-blue/90 transition-colors">
            Export
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Asta Sync Modal
export const AstaSyncModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asta Powerproject Sync">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Sync Status</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">Last sync: 2 hours ago</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto Sync</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sync Interval</span>
            <select className="border border-gray-300 rounded px-3 py-1 text-sm">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-blue/90 transition-colors">
            Sync Now
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Reports Modal
export const ReportsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gantt Reports & Analytics">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-2">Schedule Performance</h4>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">On track</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-2">Critical Path</h4>
            <div className="text-2xl font-bold text-red-600">12 tasks</div>
            <div className="text-sm text-gray-600">High risk</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-2">Resource Utilization</h4>
            <div className="text-2xl font-bold text-blue-600">78%</div>
            <div className="text-sm text-gray-600">Optimal</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-2">Budget Variance</h4>
            <div className="text-2xl font-bold text-amber-600">+5%</div>
            <div className="text-sm text-gray-600">Over budget</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-blue/90 transition-colors">
            Generate Report
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Mobile Modal
export const MobileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mobile Integration">
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Mobile App Connected</span>
          </div>
          <p className="text-green-700 text-sm mt-1">3 devices active</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Offline Mode</span>
            <span className="text-sm text-green-600 font-medium">Available</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Field Updates</span>
            <span className="text-sm text-blue-600 font-medium">5 pending</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Photo Capture</span>
            <span className="text-sm text-green-600 font-medium">Enabled</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-blue/90 transition-colors">
            Sync Now
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// AI Modal
export const AIModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI-Powered Insights">
      <div className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-800">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">AI Recommendations</span>
          </div>
          <p className="text-purple-700 text-sm mt-1">3 new insights available</p>
        </div>
        <div className="space-y-3">
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm">Schedule Optimization</h4>
                <p className="text-xs text-gray-600 mt-1">Reduce project duration by 5 days</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">High Impact</span>
            </div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm">Resource Reallocation</h4>
                <p className="text-xs text-gray-600 mt-1">Move 2 resources to critical tasks</p>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Medium Impact</span>
            </div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm">Risk Mitigation</h4>
                <p className="text-xs text-gray-600 mt-1">Add buffer time to 3 tasks</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Low Risk</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-blue/90 transition-colors">
            Apply Recommendations
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}; 