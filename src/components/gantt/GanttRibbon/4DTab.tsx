import React, { useState } from 'react';
import { 
  CubeIcon,
  ArrowPathIcon,
  LinkIcon,
  NoSymbolIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  StopIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';

export const Tab4D: React.FC = () => {
  const { state } = useProjectView();
  const { selectedTasks } = state;
  const { canAccess } = usePermissions();
  
  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // 4D specific state
  const [isModelLinked, setIsModelLinked] = useState(false);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [linkedObjects, setLinkedObjects] = useState<string[]>([]);
  const [modelName, setModelName] = useState<string>('No Model Linked');
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const can = (key: string) => canAccess(`gantt.4d.${key}`);

  const handle4DAction = (action: string, payload?: any) => {
    if (!can(action)) {
      setOperationStatus({
        type: 'error',
        message: 'Permission denied for 4D action: ' + action
      });
      return;
    }

    switch (action) {
      case 'link-model':
        // Simulate IFC model linking
        setIsModelLinked(true);
        setModelName('Sample_IFC_Model.ifc');
        setLinkedObjects(['Wall_001', 'Column_002', 'Beam_003', 'Slab_004']);
        setOperationStatus({
          type: 'success',
          message: 'IFC model linked successfully'
        });
        break;

      case 'reload-model':
        if (!isModelLinked) {
          setOperationStatus({
            type: 'error',
            message: 'No model linked to reload'
          });
          return;
        }
        setOperationStatus({
          type: 'success',
          message: 'Model reloaded successfully'
        });
        break;

      case 'auto-link':
        if (!isModelLinked) {
          setOperationStatus({
            type: 'error',
            message: 'Please link a model first'
          });
          return;
        }
        if (!selectedTasks.length) {
          setOperationStatus({
            type: 'error',
            message: 'No tasks selected for auto-linking'
          });
          return;
        }
        // Simulate auto-linking by name matching
        const newLinks = selectedTasks.map(taskId => `Object_${taskId}`);
        setLinkedObjects(prev => [...prev, ...newLinks]);
        setOperationStatus({
          type: 'success',
          message: `Auto-linked ${selectedTasks.length} tasks to model objects`
        });
        break;

      case 'clear-links':
        setLinkedObjects([]);
        setOperationStatus({
          type: 'success',
          message: 'All activity-object links cleared'
        });
        break;

      case 'show-all-objects':
        if (!isModelLinked) {
          setOperationStatus({
            type: 'error',
            message: 'No model linked to show objects'
          });
          return;
        }
        setOperationStatus({
          type: 'success',
          message: 'Showing all model objects'
        });
        break;

      case 'show-linked-only':
        if (!isModelLinked) {
          setOperationStatus({
            type: 'error',
            message: 'No model linked to show objects'
          });
          return;
        }
        if (!linkedObjects.length) {
          setOperationStatus({
            type: 'error',
            message: 'No objects are currently linked'
          });
          return;
        }
        setOperationStatus({
          type: 'success',
          message: `Showing ${linkedObjects.length} linked objects only`
        });
        break;

      case 'play-simulation':
        if (!isModelLinked) {
          setOperationStatus({
            type: 'error',
            message: 'Please link a model first'
          });
          return;
        }
        if (!linkedObjects.length) {
          setOperationStatus({
            type: 'error',
            message: 'No objects linked for simulation'
          });
          return;
        }
        setIsPlaybackActive(true);
        setPlaybackProgress(0);
        setOperationStatus({
          type: 'success',
          message: '4D simulation started'
        });
        break;

      case 'stop-simulation':
        setIsPlaybackActive(false);
        setPlaybackProgress(0);
        setOperationStatus({
          type: 'success',
          message: '4D simulation stopped'
        });
        break;

      case 'upload-model':
        setOperationStatus({
          type: 'info',
          message: 'Model upload feature coming soon'
        });
        break;

      case 'model-settings':
        openModal('model-settings');
        break;

      case 'link-manager':
        openModal('link-manager');
        break;

      case 'playback-settings':
        openModal('playback-settings');
        break;
    }
  };

  const openModal = (id: string) => setModal(id);

  // Clear status message after 3 seconds
  React.useEffect(() => {
    if (operationStatus) {
      const timer = setTimeout(() => setOperationStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [operationStatus]);

  // Simulate playback progress
  React.useEffect(() => {
    if (isPlaybackActive) {
      const interval = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            setIsPlaybackActive(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaybackActive]);

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Model Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handle4DAction('link-model')}
              disabled={isModelLinked}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 rounded transition-colors ${
                isModelLinked 
                  ? 'bg-green-100 border-green-500 text-green-700' 
                  : 'bg-white hover:bg-blue-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Link IFC Model"
            >
              <CubeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Link Model</span>
            </button>
            <button
              onClick={() => handle4DAction('reload-model')}
              disabled={!isModelLinked}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reload Model"
            >
              <ArrowPathIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Reload</span>
            </button>
            <button
              onClick={() => handle4DAction('upload-model')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Upload Model"
            >
              <DocumentArrowUpIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Upload</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Model</div>
        </div>

        {/* Activity Links Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handle4DAction('auto-link')}
              disabled={!isModelLinked || !selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Auto-Link by Name"
            >
              <LinkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Auto-Link</span>
            </button>
            <button
              onClick={() => handle4DAction('clear-links')}
              disabled={!linkedObjects.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear Links"
            >
              <NoSymbolIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Clear Links</span>
            </button>
            <button
              onClick={() => handle4DAction('link-manager')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
              title="Link Manager"
            >
              <CogIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Manager</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Activity Links</div>
        </div>

        {/* Object Visibility Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handle4DAction('show-all-objects')}
              disabled={!isModelLinked}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Show All Objects"
            >
              <EyeIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Show All</span>
            </button>
            <button
              onClick={() => handle4DAction('show-linked-only')}
              disabled={!isModelLinked || !linkedObjects.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-yellow-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Show Linked Only"
            >
              <EyeSlashIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Linked Only</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Objects</div>
        </div>

        {/* Playback Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handle4DAction('play-simulation')}
              disabled={!isModelLinked || !linkedObjects.length || isPlaybackActive}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Play 4D Simulation"
            >
              <PlayIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Play</span>
            </button>
            <button
              onClick={() => handle4DAction('stop-simulation')}
              disabled={!isPlaybackActive}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Stop Simulation"
            >
              <StopIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Stop</span>
            </button>
            <button
              onClick={() => handle4DAction('playback-settings')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-orange-50 rounded transition-colors"
              title="Playback Settings"
            >
              <ChartBarIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Settings</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Playback</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Model: {modelName}
          </div>
          <div className="text-xs text-gray-500">
            Linked Objects: {linkedObjects.length}
          </div>
          <div className="text-xs text-gray-500">
            Status: {isPlaybackActive ? 'Playing' : 'Stopped'}
          </div>
          {isPlaybackActive && (
            <div className="text-xs text-gray-500">
              Progress: {playbackProgress}%
            </div>
          )}
        </div>
      </div>

      {/* Playback Progress Bar */}
      {isPlaybackActive && (
        <div className="bg-gray-100 p-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${playbackProgress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600">{playbackProgress}%</span>
          </div>
        </div>
      )}

      {/* Status Message */}
      {operationStatus && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
          operationStatus.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
          operationStatus.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
          'bg-blue-100 border border-blue-300 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            {operationStatus.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : operationStatus.type === 'error' ? (
              <ExclamationTriangleIcon className="h-5 w-5" />
            ) : (
              <InformationCircleIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{operationStatus.message}</span>
            <button
              onClick={() => setOperationStatus(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {modal.replace('-', ' ')} Manager
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {modal === 'model-settings' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Model Settings</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>IFC Model Integration:</strong> Link IFC models to project tasks for 4D visualization.</p>
                  <p><strong>Model Synchronization:</strong> Upload, parse, and store IFC files per project.</p>
                  <p><strong>Object Mapping:</strong> Associate model elements with Gantt chart activities.</p>
                  <p><strong>Real-time Updates:</strong> Model changes reflect immediately in the 4D view.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-800 mb-2">Current Model:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Name: {modelName}</div>
                    <div>Status: {isModelLinked ? 'Linked' : 'Not Linked'}</div>
                    <div>Objects: {linkedObjects.length} linked</div>
                  </div>
                </div>
              </div>
            )}

            {modal === 'link-manager' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Activity-Object Link Manager</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Auto-Linking:</strong> Automatically match task names with model object names.</p>
                  <p><strong>Manual Linking:</strong> Manually create associations between tasks and objects.</p>
                  <p><strong>Link Validation:</strong> Verify and validate all activity-object relationships.</p>
                  <p><strong>Bulk Operations:</strong> Link multiple tasks to multiple objects at once.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-800 mb-2">Linked Objects:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    {linkedObjects.length > 0 ? (
                      linkedObjects.map((obj, index) => (
                        <div key={index}>• {obj}</div>
                      ))
                    ) : (
                      <div>No objects currently linked</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {modal === 'playback-settings' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">4D Playback Settings</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Playback Speed:</strong> Control the speed of 4D simulation playback.</p>
                  <p><strong>Visual Effects:</strong> Configure object visibility and highlighting during playback.</p>
                  <p><strong>Time Controls:</strong> Set start/end dates and time intervals for simulation.</p>
                  <p><strong>Export Options:</strong> Save 4D animations and screenshots for presentations.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-800 mb-2">Current Settings:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Playback Status: {isPlaybackActive ? 'Active' : 'Inactive'}</div>
                    <div>Progress: {playbackProgress}%</div>
                    <div>Linked Objects: {linkedObjects.length}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 