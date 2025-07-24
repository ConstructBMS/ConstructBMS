import React, { useState } from 'react';
import {
  LinkIcon,
  NoSymbolIcon,
  PlayIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentArrowUpIcon,
  Cog6ToothIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Task } from '../../../services/ganttTaskService';

export const Tab4D: React.FC = () => {
  const { state } = useProjectView();
  const { selectedTasks } = state;
  const { canAccess } = usePermissions();

  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const can = (key: string) => canAccess(`gantt.4d.${key}`);

  // Mock tasks data - in real implementation this would come from a service
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Sample Task 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 7,
      percentComplete: 0,
      status: 'not-started',
      level: 0,
      position: 0,
      taskType: 'normal',
      priority: 'medium',
      predecessors: [],
      successors: [],
    },
  ];

  // Initialize tasks with mock data
  React.useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const handle4DAction = (action: string, payload?: any) => {
    if (!can(action)) {
      console.log('Permission denied for 4D action:', action);
      return;
    }

    switch (action) {
      case 'link-ifc-object':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              ifcObjectId: payload || 'ifc-guid-123',
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log(
          'Linked IFC object:',
          payload || 'ifc-guid-123',
          'to tasks:',
          selectedTasks
        );
        break;

      case 'unlink-ifc-object':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const { ifcObjectId, ...updatedTask } = task;
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Unlinked IFC objects from tasks:', selectedTasks);
        break;

      case 'preview-4d':
        alert('4D preview placeholder — integrate 3D canvas or Forge viewer.');
        console.log('4D preview requested for tasks:', selectedTasks);
        break;

      case 'load-ifc-model':
        alert('IFC model loading placeholder — integrate with 3D viewer.');
        console.log('IFC model loading requested');
        break;

      case 'toggle-view':
        setShowModel(!showModel);
        console.log('Model visibility toggled:', !showModel);
        break;

      case 'toggle-simulation':
        setPlaying(!playing);
        console.log('Simulation toggled:', !playing);
        break;

      default:
        console.log('Unknown 4D action:', action);
    }
  };

  const openModal = (id: string) => setModal(id);

  const get4DInfo = () => {
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    return {
      selectedCount: selectedTasks.length,
      hasIfcLink: selectedTask?.ifcObjectId,
      ifcObjectId: selectedTask?.ifcObjectId,
      modelVisible: showModel,
      isPlaying: playing,
    };
  };

  const fourDInfo = get4DInfo();

  const ifcObjects = [
    {
      id: 'ifc-guid-123',
      name: 'Foundation Slab',
      type: 'IfcSlab',
      description: 'Concrete foundation slab',
    },
    {
      id: 'ifc-guid-456',
      name: 'Column A1',
      type: 'IfcColumn',
      description: 'Structural column A1',
    },
    {
      id: 'ifc-guid-789',
      name: 'Wall Section 1',
      type: 'IfcWall',
      description: 'Exterior wall section',
    },
    {
      id: 'ifc-guid-012',
      name: 'Beam B1',
      type: 'IfcBeam',
      description: 'Structural beam B1',
    },
    {
      id: 'ifc-guid-345',
      name: 'Roof Slab',
      type: 'IfcSlab',
      description: 'Roof slab element',
    },
    {
      id: 'ifc-guid-678',
      name: 'Door D1',
      type: 'IfcDoor',
      description: 'Main entrance door',
    },
  ];

  const sampleLinks = [
    {
      id: 'link-1',
      taskId: 'task-1',
      ifcObjectId: 'ifc-guid-123',
      status: 'active',
    },
    {
      id: 'link-2',
      taskId: 'task-2',
      ifcObjectId: 'ifc-guid-456',
      status: 'pending',
    },
  ];

  return (
    <>
      <div className='ribbon-tab-content'>
        {/* IFC Linking Tools */}
        <div className='ribbon-section'>
          <div className='ribbon-section-header'>Link</div>
          <div className='ribbon-section-content'>
            <button
              onClick={() => handle4DAction('link-ifc-object')}
              disabled={!selectedTasks.length}
              className='ribbon-button flex items-center space-x-1'
              title='Link to IFC Object'
            >
              <LinkIcon className='w-4 h-4' />
              <span>Link</span>
            </button>
            <button
              onClick={() => handle4DAction('unlink-ifc-object')}
              disabled={!selectedTasks.length}
              className='ribbon-button ribbon-button-danger flex items-center space-x-1'
              title='Unlink IFC'
            >
              <NoSymbolIcon className='w-4 h-4' />
              <span>Unlink</span>
            </button>
          </div>
        </div>

        {/* 4D Preview / Timeline */}
        <div className='ribbon-section'>
          <div className='ribbon-section-header'>Preview</div>
          <div className='ribbon-section-content'>
            <button
              onClick={() => handle4DAction('preview-4d')}
              disabled={!selectedTasks.length}
              className='ribbon-button ribbon-button-success flex items-center space-x-1'
              title='Preview 4D Sequence'
            >
              <PlayIcon className='w-4 h-4' />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Model Tools */}
        <div className='ribbon-section'>
          <div className='ribbon-section-header'>Model</div>
          <div className='ribbon-section-content'>
            <button
              onClick={() => handle4DAction('load-ifc-model')}
              disabled
              className='ribbon-button flex items-center space-x-1'
              title='Load IFC Model'
            >
              <DocumentArrowUpIcon className='w-4 h-4' />
              <span>Load IFC</span>
            </button>
            <button
              onClick={() => handle4DAction('toggle-view')}
              className='ribbon-button flex items-center space-x-1'
              title='Toggle View'
            >
              {showModel ? (
                <EyeIcon className='w-4 h-4' />
              ) : (
                <EyeSlashIcon className='w-4 h-4' />
              )}
              <span>{showModel ? 'Show' : 'Hide'}</span>
            </button>
            <button
              onClick={() => openModal('4d-manager')}
              className='ribbon-button ribbon-button-primary flex items-center space-x-1'
              title='4D Manager'
            >
              <Cog6ToothIcon className='w-4 h-4' />
              <span>Manage</span>
            </button>
          </div>
        </div>

        {/* Status Display */}
        <div className='flex flex-col justify-end ml-auto'>
          <div className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded space-y-1'>
            <div>Model: {showModel ? 'Visible' : 'Hidden'}</div>
            <div>Links: {sampleLinks.length}</div>
            <div>Simulation: {playing ? 'Playing' : 'Stopped'}</div>
          </div>
        </div>
      </div>

      {/* Modal System */}
      {modal && (
        <div className='fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-800 capitalize'>
                {modal.replace('-', ' ')} Manager
              </h2>
              <button
                onClick={() => setModal(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                <XMarkIcon className='h-6 w-6' />
              </button>
            </div>

            {modal === '4d-manager' && (
              <div className='space-y-6'>
                {/* IFC Object Selection */}
                <div>
                  <h3 className='text-md font-medium text-gray-700 mb-3'>
                    IFC Object Selection
                  </h3>
                  <div className='grid grid-cols-2 gap-2'>
                    {ifcObjects.map(ifcObject => (
                      <button
                        key={ifcObject.id}
                        onClick={() => {
                          handle4DAction('link-ifc-object', ifcObject.id);
                          setModal(null);
                        }}
                        disabled={!selectedTasks.length}
                        className='flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <LinkIcon className='h-4 w-4 mr-2 text-gray-600' />
                        <div className='text-left'>
                          <div className='text-sm font-medium text-gray-700'>
                            {ifcObject.name}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {ifcObject.type}
                          </div>
                          <div className='text-xs text-gray-400'>
                            {ifcObject.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4D Preview Options */}
                <div>
                  <h3 className='text-md font-medium text-gray-700 mb-3'>
                    4D Preview Options
                  </h3>
                  <div className='space-y-3'>
                    <button
                      onClick={() => {
                        handle4DAction('preview-4d');
                        setModal(null);
                      }}
                      disabled={!selectedTasks.length}
                      className='w-full flex items-center p-3 border border-gray-200 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <PlayIcon className='h-4 w-4 mr-2 text-gray-600' />
                      <div className='text-left'>
                        <div className='text-sm font-medium text-gray-700'>
                          Preview 4D Sequence
                        </div>
                        <div className='text-xs text-gray-500'>
                          Simulate construction timeline visually
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handle4DAction('load-ifc-model');
                        setModal(null);
                      }}
                      disabled
                      className='w-full flex items-center p-3 border border-gray-200 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <DocumentArrowUpIcon className='h-4 w-4 mr-2 text-gray-600' />
                      <div className='text-left'>
                        <div className='text-sm font-medium text-gray-700'>
                          Load IFC Model
                        </div>
                        <div className='text-xs text-gray-500'>
                          Import IFC file for 4D simulation (future)
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Model Visibility */}
                <div>
                  <h3 className='text-md font-medium text-gray-700 mb-3'>
                    Model Visibility
                  </h3>
                  <div className='space-y-2'>
                    <button
                      onClick={() => {
                        handle4DAction('toggle-view');
                        setModal(null);
                      }}
                      className='w-full flex items-center p-3 border border-gray-200 rounded hover:bg-purple-50'
                    >
                      {showModel ? (
                        <EyeSlashIcon className='h-4 w-4 mr-2 text-gray-600' />
                      ) : (
                        <EyeIcon className='h-4 w-4 mr-2 text-gray-600' />
                      )}
                      <div className='text-left'>
                        <div className='text-sm font-medium text-gray-700'>
                          {showModel ? 'Hide Model' : 'Show Model'}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {showModel
                            ? 'Hide 3D model from view'
                            : 'Show 3D model in view'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modal === '4d-info' && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-2 text-gray-600'>
                  <InformationCircleIcon className='h-5 w-5' />
                  <span className='text-sm'>4D BIM Management Information</span>
                </div>
                <div className='text-sm text-gray-600 space-y-2'>
                  <p>
                    <strong>IFC Linking:</strong> Link Gantt tasks to 3D objects
                    from external models.
                  </p>
                  <p>
                    <strong>4D Preview:</strong> Simulate construction timelines
                    visually.
                  </p>
                  <p>
                    <strong>Model Management:</strong> Load and manage IFC
                    models for 4D simulation.
                  </p>
                  <p>
                    <strong>Visual Simulation:</strong> See how construction
                    progresses over time.
                  </p>
                  <p>
                    <strong>BIM Integration:</strong> Connect project schedules
                    with 3D building models.
                  </p>
                  <p>
                    <strong>Future Features:</strong> Advanced 3D viewer
                    integration and object selection.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
