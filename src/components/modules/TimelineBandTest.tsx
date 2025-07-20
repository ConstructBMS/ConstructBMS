import React, { useState, useEffect, useRef } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline';
import TimelineBand from './TimelineBand';
import { timelineBandService } from '../../services/timelineBandService';
import type { TimelinePhase, ZoomLevel } from '../../services/timelineBandService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui';

const TimelineBandTest: React.FC = () => {
  const [projectId, setProjectId] = useState<string>('demo-project-1');
  const [userRole, setUserRole] = useState<string>('editor');
  const [loading, setLoading] = useState<boolean>(true);
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showPhaseDetails, setShowPhaseDetails] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load demo data on mount
  useEffect(() => {
    loadDemoData();
  }, [projectId]);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      
      // Load phases and config
      const [phasesData, configData] = await Promise.all([
        timelineBandService.getTimelinePhases(projectId),
        timelineBandService.getTimelineConfig(projectId)
      ]);
      
      setPhases(phasesData);
      setConfig(configData);
      setLastUpdate('Demo data loaded');
    } catch (error) {
      console.error('Failed to load demo data:', error);
      setErrorMessage('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleScrollSync = (newScrollLeft: number) => {
    setScrollLeft(newScrollLeft);
  };

  const handleCreateTestPhase = async () => {
    try {
      const newPhase = await timelineBandService.createTimelinePhase({
        project_id: projectId,
        name: 'Test Phase',
        description: 'A test phase created from the test interface',
        start_date: '2024-06-01',
        end_date: '2024-07-31',
        color: '#8b5cf6',
        sequence: phases.length + 1,
        is_active: true
      });

      if (newPhase) {
        setPhases(prev => [...prev, newPhase]);
        setLastUpdate('Test phase created');
        setInfoMessage('Test phase created successfully');
        setTimeout(() => setInfoMessage(null), 3000);
      }
    } catch (error) {
      console.error('Test phase creation failed:', error);
      setErrorMessage('Failed to create test phase');
    }
  };

  const handleDeleteAllPhases = async () => {
    if (!confirm('Are you sure you want to delete all phases?')) return;

    try {
      for (const phase of phases) {
        await timelineBandService.deleteTimelinePhase(phase.id);
      }
      setPhases([]);
      setLastUpdate('All phases deleted');
      setInfoMessage('All phases deleted successfully');
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (error) {
      console.error('Delete all phases failed:', error);
      setErrorMessage('Failed to delete all phases');
    }
  };

  const handleValidatePhases = async () => {
    try {
      const issues: string[] = [];

      // Check for overlapping phases
      for (let i = 0; i < phases.length; i++) {
        for (let j = i + 1; j < phases.length; j++) {
          const phase1 = phases[i];
          const phase2 = phases[j];
          
          const start1 = new Date(phase1.start_date);
          const end1 = new Date(phase1.end_date);
          const start2 = new Date(phase2.start_date);
          const end2 = new Date(phase2.end_date);
          
          if (start1 < end2 && start2 < end1) {
            issues.push(`Overlapping phases: ${phase1.name} and ${phase2.name}`);
          }
        }
      }

      // Check for invalid dates
      for (const phase of phases) {
        const start = new Date(phase.start_date);
        const end = new Date(phase.end_date);
        
        if (start >= end) {
          issues.push(`Invalid date range for phase: ${phase.name}`);
        }
      }

      if (issues.length === 0) {
        setInfoMessage('All phases are valid');
      } else {
        setErrorMessage(`Validation issues found:\n${issues.join('\n')}`);
      }
      setTimeout(() => {
        setInfoMessage(null);
        setErrorMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Phase validation failed:', error);
      setErrorMessage('Failed to validate phases');
    }
  };

  const getPhaseStats = () => {
    const totalDuration = phases.reduce((sum, phase) => {
      const start = new Date(phase.start_date);
      const end = new Date(phase.end_date);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    const earliestStart = phases.length > 0 ? 
      new Date(Math.min(...phases.map(p => new Date(p.start_date).getTime()))) : null;
    const latestEnd = phases.length > 0 ? 
      new Date(Math.max(...phases.map(p => new Date(p.end_date).getTime()))) : null;

    return {
      count: phases.length,
      totalDuration,
      earliestStart,
      latestEnd
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  const stats = getPhaseStats();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Timeline Band Test</h1>
          <p className="text-gray-600">Test the Timeline Band system with zoomable scales, phase bands, and scroll synchronization</p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Role */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">User Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Project ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Project ID</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="demo-project-1">Demo Project 1</option>
                <option value="demo-project-2">Demo Project 2</option>
                <option value="demo-project-3">Demo Project 3</option>
              </select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Actions</label>
              <div className="space-y-1">
                <button
                  onClick={loadDemoData}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                  Reload Data
                </button>
                <button
                  onClick={handleCreateTestPhase}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Test Phase
                </button>
              </div>
            </div>

            {/* Phase Operations */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phase Operations</label>
              <div className="space-y-1">
                <button
                  onClick={handleValidatePhases}
                  className="w-full px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                >
                  <CheckIcon className="w-4 h-4 inline mr-1" />
                  Validate Phases
                </button>
                <button
                  onClick={handleDeleteAllPhases}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  <TrashIcon className="w-4 h-4 inline mr-1" />
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Phases: <span className="font-medium text-gray-900">{stats.count}</span>
              </span>
              <span className="text-gray-600">
                Total Duration: <span className="font-medium text-gray-900">{stats.totalDuration} days</span>
              </span>
              <span className="text-gray-600">
                Project: <span className="font-medium text-blue-600">{projectId}</span>
              </span>
              <span className="text-gray-600">
                User Role: <span className="font-medium text-gray-900">{userRole}</span>
              </span>
              <span className="text-gray-600">
                Scroll: <span className="font-medium text-gray-900">{Math.round(scrollLeft)}px</span>
              </span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500 text-xs">
                Last: {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Timeline Statistics */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Timeline Statistics</h3>
            <button
              onClick={() => setShowPhaseDetails(!showPhaseDetails)}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              {showPhaseDetails ? <EyeSlashIcon className="w-4 h-4 mr-1" /> : <EyeIcon className="w-4 h-4 mr-1" />}
              {showPhaseDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-700">Total Phases</div>
              <div className="text-2xl font-bold text-blue-900">{stats.count}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm font-medium text-green-700">Total Duration</div>
              <div className="text-2xl font-bold text-green-900">{stats.totalDuration} days</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-700">Earliest Start</div>
              <div className="text-lg font-bold text-purple-900">
                {stats.earliestStart ? stats.earliestStart.toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-sm font-medium text-orange-700">Latest End</div>
              <div className="text-lg font-bold text-orange-900">
                {stats.latestEnd ? stats.latestEnd.toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Phase Details */}
          {showPhaseDetails && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {phases.map(phase => {
                    const start = new Date(phase.start_date);
                    const end = new Date(phase.end_date);
                    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={phase.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{phase.name}</div>
                            <div className="text-sm text-gray-500">{phase.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {duration} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {start.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {end.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded border border-gray-300 mr-2"
                              style={{ backgroundColor: phase.color }}
                            />
                            <span className="text-sm text-gray-900">{phase.color}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Timeline Band */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Timeline Band</h3>
            <p className="text-sm text-gray-600 mt-1">
              Interactive timeline with zoomable scales, phase bands, and scroll synchronization
            </p>
          </div>
          
          <div ref={containerRef}>
            <TimelineBand
              projectId={projectId}
              userRole={userRole}
              onScrollSync={handleScrollSync}
              scrollLeft={scrollLeft}
              width={1200}
              height={120}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">How to Use Timeline Band</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use zoom controls to change the timeline scale (day, week, month, quarter, year)</li>
                <li>• Toggle "Today" and "Weekends" display options</li>
                <li>• Click on phase bands to edit them (if you have edit permissions)</li>
                <li>• Use "Add Phase" to create new timeline phases</li>
                <li>• Scroll horizontally to navigate the timeline</li>
                <li>• The red line indicates today's date</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              <div className="whitespace-pre-line">{errorMessage}</div>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              {infoMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineBandTest; 