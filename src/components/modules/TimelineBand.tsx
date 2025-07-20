import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { timelineBandService } from '../../services/timelineBandService';
import type { TimelinePhase, ZoomLevel, TimelineScale, TimelineConfig } from '../../services/timelineBandService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui';

interface TimelineBandProps {
  projectId: string;
  userRole: string;
  onScrollSync?: (scrollLeft: number) => void;
  scrollLeft?: number;
  width?: number;
  height?: number;
}

interface PhaseEditState {
  phaseId: string | null;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  color: string;
}

const TimelineBand: React.FC<TimelineBandProps> = ({
  projectId,
  userRole,
  onScrollSync,
  scrollLeft = 0,
  width = 1200,
  height = 120
}) => {
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [config, setConfig] = useState<TimelineConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState<PhaseEditState>({
    phaseId: null,
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    color: '#3b82f6'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTodayMarker, setShowTodayMarker] = useState(true);
  const [showWeekends, setShowWeekends] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const canEdit = userRole !== 'viewer';

  // Load timeline data
  useEffect(() => {
    loadTimelineData();
  }, [projectId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const [phasesData, configData] = await Promise.all([
        timelineBandService.getTimelinePhases(projectId),
        timelineBandService.getTimelineConfig(projectId)
      ]);
      
      setPhases(phasesData);
      setConfig(configData);
      setShowTodayMarker(configData?.show_today_marker ?? true);
      setShowWeekends(configData?.show_weekends ?? true);
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll synchronization
  useEffect(() => {
    if (containerRef.current && onScrollSync) {
      containerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft, onScrollSync]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (onScrollSync) {
      onScrollSync(e.currentTarget.scrollLeft);
    }
  }, [onScrollSync]);

  // Handle zoom level change
  const handleZoomChange = async (zoomLevel: ZoomLevel) => {
    if (!config) return;

    const updatedConfig = { ...config, zoom_level: zoomLevel };
    setConfig(updatedConfig);
    
    try {
      await timelineBandService.updateTimelineConfig(projectId, { zoom_level: zoomLevel });
    } catch (error) {
      console.error('Failed to update zoom level:', error);
    }
  };

  // Handle phase creation
  const handleCreatePhase = async () => {
    if (!config) return;

    const newPhase = await timelineBandService.createTimelinePhase({
      project_id: projectId,
      name: editState.name,
      description: editState.description,
      start_date: editState.startDate,
      end_date: editState.endDate,
      color: editState.color,
      sequence: phases.length + 1,
      is_active: true
    });

    if (newPhase) {
      setPhases(prev => [...prev, newPhase]);
      setShowEditModal(false);
      resetEditState();
    }
  };

  // Handle phase update
  const handleUpdatePhase = async () => {
    if (!editState.phaseId) return;

    const updatedPhase = await timelineBandService.updateTimelinePhase(editState.phaseId, {
      name: editState.name,
      description: editState.description,
      start_date: editState.startDate,
      end_date: editState.endDate,
      color: editState.color
    });

    if (updatedPhase) {
      setPhases(prev => prev.map(p => p.id === editState.phaseId ? updatedPhase : p));
      setShowEditModal(false);
      resetEditState();
    }
  };

  // Handle phase deletion
  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('Are you sure you want to delete this phase?')) return;

    const success = await timelineBandService.deleteTimelinePhase(phaseId);
    if (success) {
      setPhases(prev => prev.filter(p => p.id !== phaseId));
    }
  };

  // Open edit modal
  const openEditModal = (phase?: TimelinePhase) => {
    if (phase) {
      setEditState({
        phaseId: phase.id,
        name: phase.name,
        description: phase.description || '',
        startDate: phase.start_date,
        endDate: phase.end_date,
        color: phase.color
      });
    } else {
      resetEditState();
    }
    setShowEditModal(true);
  };

  // Reset edit state
  const resetEditState = () => {
    setEditState({
      phaseId: null,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      color: '#3b82f6'
    });
  };

  // Get current scale configuration
  const getCurrentScale = (): TimelineScale => {
    return timelineBandService.getZoomLevelConfig(config?.zoom_level || 'week');
  };

  // Generate timeline ticks
  const generateTicks = (): Date[] => {
    if (!config) return [];
    
    const startDate = new Date(config.start_date);
    const endDate = new Date(config.end_date);
    const scale = getCurrentScale();
    
    return timelineBandService.generateTimelineTicks(startDate, endDate, scale);
  };

  // Calculate phase position and width
  const calculatePhaseDimensions = (phase: TimelinePhase) => {
    if (!config) return { left: 0, width: 0 };
    
    const startDate = new Date(config.start_date);
    const phaseStart = new Date(phase.start_date);
    const phaseEnd = new Date(phase.end_date);
    const scale = getCurrentScale();
    
    const left = timelineBandService.calculateDatePosition(phaseStart, startDate, scale);
    const right = timelineBandService.calculateDatePosition(phaseEnd, startDate, scale);
    
    return {
      left,
      width: Math.max(right - left, 20) // Minimum width of 20px
    };
  };

  // Get today marker position
  const getTodayMarkerPosition = (): number => {
    if (!config || !showTodayMarker) return -1;
    
    const startDate = new Date(config.start_date);
    const scale = getCurrentScale();
    
    return timelineBandService.getTodayPosition(startDate, scale);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 text-gray-500">
        No timeline configuration found
      </div>
    );
  }

  const scale = getCurrentScale();
  const ticks = generateTicks();
  const todayPosition = getTodayMarkerPosition();

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                const levels: ZoomLevel[] = ['day', 'week', 'month', 'quarter', 'year'];
                const currentIndex = levels.indexOf(config.zoom_level);
                const newIndex = Math.max(0, currentIndex - 1);
                handleZoomChange(levels[newIndex]);
              }}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 px-2 py-1 bg-white border rounded">
              {config.zoom_level.charAt(0).toUpperCase() + config.zoom_level.slice(1)}
            </span>
            <button
              onClick={() => {
                const levels: ZoomLevel[] = ['day', 'week', 'month', 'quarter', 'year'];
                const currentIndex = levels.indexOf(config.zoom_level);
                const newIndex = Math.min(levels.length - 1, currentIndex + 1);
                handleZoomChange(levels[newIndex]);
              }}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Display Options */}
          <div className="flex items-center space-x-2 ml-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showTodayMarker}
                onChange={(e) => setShowTodayMarker(e.target.checked)}
                className="mr-1"
              />
              Today
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showWeekends}
                onChange={(e) => setShowWeekends(e.target.checked)}
                className="mr-1"
              />
              Weekends
            </label>
          </div>
        </div>

        {/* Phase Management */}
        {canEdit && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openEditModal()}
              className="flex items-center px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Add Phase
            </button>
          </div>
        )}
      </div>

      {/* Timeline Band */}
      <div 
        ref={containerRef}
        className="relative overflow-x-auto"
        style={{ width, height }}
        onScroll={handleScroll}
      >
        <div className="relative" style={{ minWidth: width * 2 }}>
          {/* Phase Bands */}
          <div className="relative h-16">
            {phases.map((phase) => {
              const { left, width: phaseWidth } = calculatePhaseDimensions(phase);
              
              return (
                <div
                  key={phase.id}
                  className="absolute top-0 h-full flex items-center"
                  style={{
                    left: `${left}px`,
                    width: `${phaseWidth}px`
                  }}
                >
                  <div
                    className="w-full h-8 rounded border-2 border-l-4 flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: phase.color,
                      borderLeftColor: phase.color
                    }}
                    onClick={() => canEdit && openEditModal(phase)}
                    title={`${phase.name}: ${phase.start_date} to ${phase.end_date}`}
                  >
                    {phase.name}
                  </div>
                  
                  {canEdit && (
                    <div className="absolute -top-1 -right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(phase);
                        }}
                        className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
                      >
                        <PencilIcon className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhase(phase.id);
                        }}
                        className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-red-50"
                      >
                        <TrashIcon className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Timeline Scale */}
          <div className="relative h-8 border-t border-gray-200">
            {ticks.map((tick, index) => {
              const position = timelineBandService.calculateDatePosition(tick, new Date(config.start_date), scale);
              const isWeekend = showWeekends && timelineBandService.isWeekend(tick);
              const isMajorTick = index % scale.majorTickInterval === 0;
              
              return (
                <div
                  key={tick.toISOString()}
                  className="absolute top-0 h-full flex flex-col"
                  style={{ left: `${position}px` }}
                >
                  <div
                    className={`w-px h-full ${
                      isWeekend ? 'bg-gray-300' : 'bg-gray-200'
                    }`}
                  />
                  {isMajorTick && (
                    <div className="absolute bottom-0 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                      {timelineBandService.formatDateLabel(tick, scale.labelFormat)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Today Marker */}
          {showTodayMarker && todayPosition >= 0 && (
            <div
              className="absolute top-0 h-full w-0.5 bg-red-500 z-10"
              style={{ left: `${todayPosition}px` }}
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Edit Phase Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editState.phaseId ? 'Edit Phase' : 'Add Phase'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase Name *
                </label>
                <input
                  type="text"
                  value={editState.name}
                  onChange={(e) => setEditState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phase name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editState.description}
                  onChange={(e) => setEditState(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phase description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={editState.startDate}
                    onChange={(e) => setEditState(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={editState.endDate}
                    onChange={(e) => setEditState(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={editState.color}
                  onChange={(e) => setEditState(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={editState.phaseId ? handleUpdatePhase : handleCreatePhase}
                  disabled={!editState.name || !editState.startDate || !editState.endDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {editState.phaseId ? 'Update Phase' : 'Create Phase'}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditState();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineBand; 